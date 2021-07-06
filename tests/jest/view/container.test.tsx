import { mount } from 'enzyme';
import { h } from 'preact';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Config } from '../../../src/config';
import { Container } from '../../../src/view/container';
import StorageUtils from '../../../src/storage/storageUtils';
import Header from '../../../src/header';
import {
  PipelineProcessor,
  ProcessorType,
} from '../../../src/pipeline/processor';
import { flushPromises } from '../testUtil';
import PipelineUtils from '../../../src/pipeline/pipelineUtils';
import { EventEmitter } from '../../../src/util/eventEmitter';
import { GridEvents } from '../../../src/events';
import { PluginManager } from '../../../src/plugin';
import { BaseStore } from '../../../index';

expect.extend(toHaveNoViolations);

describe('Container component', () => {
  let config: Config;

  beforeEach(() => {
    config = Config.fromUserConfig({
      data: [
        [1, 2, 3],
        ['a', 'b', 'c'],
      ],
    });
    config.eventEmitter = new EventEmitter<GridEvents>();
    config.plugin = new PluginManager();
  });

  it('should render a container with table', async () => {
    const container = mount(<Container config={config} />);

    await container.instance().componentDidMount();
    expect(container.html()).toMatchSnapshot();
    expect(container.state('status')).toBe(3);
  });

  it('should attach styles', async () => {
    config.update({
      search: {},
      pagination: {},
      style: {
        container: {
          border: '1px solid #ccc',
        },
        header: {
          padding: '5px',
        },
        footer: {
          margin: '2px',
        },
        td: {
          'font-weight': 'bold',
        },
        th: {
          border: '2px solid red',
        },
        table: {
          'font-size': '15px',
        },
      },
      width: '500px',
    });

    const container = mount(<Container config={config} />);

    await container.instance().componentDidMount();
    expect(container.html()).toMatchSnapshot();
  });

  it('should attach classNames', async () => {
    config.update({
      search: {},
      pagination: {},
      columns: [
        {
          name: 'c1',
          sort: {
            enabled: false,
          },
        },
        {
          name: 'c2',
          sort: {
            enabled: true,
          },
        },
        {
          name: 'c3',
          sort: {
            enabled: true,
          },
        },
      ],
      className: {
        container: 'test-container',
        header: 'test-header',
        footer: 'test-footer',
        td: 'test-td',
        th: 'test-th',
        table: 'test-table',
        thead: 'test-head',
        tbody: 'test-tbody',
        sort: 'test-sort',
      },
      width: '500px',
    });

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      expect(container.html()).toMatchSnapshot();
    });
  });

  it('should render a container with searchable table', async () => {
    config.update({
      search: {},
    });

    const container = mount(<Container config={config} />);
    await container.instance().componentDidMount();
    expect(container.html()).toMatchSnapshot();
  });

  it('should render a container with sortable and paginated table', async () => {
    config.update({
      search: {},
      pagination: {
        limit: 5,
      },
      columns: [
        {
          name: 'c1',
          sort: {
            enabled: false,
          },
        },
        {
          name: 'c2',
          sort: {
            enabled: true,
          },
        },
        {
          name: 'c3',
          sort: {
            enabled: true,
          },
        },
      ],
    });

    const container = mount(<Container config={config} />);
    await container.instance().componentDidMount();
    expect(container.html()).toMatchSnapshot();
  });

  it('should render a container with error', async () => {
    console.error = jest.fn();

    class ErrorProcessor extends PipelineProcessor<string, any> {
      get type(): ProcessorType {
        return ProcessorType.Limit;
      }
      _process(): string {
        throw Error('something happened');
      }
    }

    config.className = {
      error: 'my-error',
    };
    config.pipeline.register(new ErrorProcessor());

    const container = mount(<Container config={config} />);

    await container.instance().componentDidMount();
    expect(container.html()).toMatchSnapshot();
  });

  it('should not violate accessibility test', async () => {
    config.update({
      pagination: {
        limit: 1,
      },
      search: {},
      sort: true,
    });

    const container = mount(<Container config={config} />);

    container.update();
    await container.instance().componentDidMount();

    expect(await axe(container.html())).toHaveNoViolations();
  });

  it('should render a container with null array', async () => {
    config.data = [];
    config.storage = StorageUtils.createFromUserConfig(config);
    config.pipeline = PipelineUtils.createFromConfig(config);

    config.header = new Header();
    config.header.columns = [
      {
        name: 'hello',
      },
      {
        name: 'cool',
      },
      {
        name: 'actions',
      },
    ];

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      expect(container.html()).toMatchSnapshot();
    });
  });

  it('should render a container with array of objects without columns input', async () => {
    const config = Config.fromUserConfig({
      eventEmitter: new EventEmitter<GridEvents>(),
      data: [
        { name: 'boo', phoneNumber: '123' },
        { name: 'foo', phoneNumber: '456' },
        { name: 'bar', phoneNumber: '789' },
      ],
    });

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      expect(container.html()).toMatchSnapshot();
    });
  });

  it('should render a container with array of objects with string columns', async () => {
    const config = Config.fromUserConfig({
      eventEmitter: new EventEmitter<GridEvents>(),
      columns: ['Name', 'Phone Number'],
      data: [
        { name: 'boo', phoneNumber: '123' },
        { name: 'foo', phoneNumber: '456' },
        { name: 'bar', phoneNumber: '789' },
      ],
    });

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      expect(container.html()).toMatchSnapshot();
    });
  });

  it('should render a container with array of objects with object columns', async () => {
    const config = Config.fromUserConfig({
      eventEmitter: new EventEmitter<GridEvents>(),
      columns: [
        {
          name: 'Name',
          id: 'name',
        },
        {
          name: 'Phone Number',
          id: 'phone',
        },
      ],
      data: [
        { name: 'boo', phone: '123' },
        { name: 'foo', phone: '456' },
        { name: 'bar', phone: '789' },
      ],
    });

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      expect(container.html()).toMatchSnapshot();
    });
  });

  it('should remove the BaseStore listeners', async () => {
    config.update({
      search: {},
      pagination: {},
      columns: ['Name', 'Phone Number'],
      sort: true,
    });

    const mockOn = jest.spyOn(BaseStore.prototype, 'on');
    const mockOff = jest.spyOn(BaseStore.prototype, 'off');

    const container = mount(<Container config={config} />);

    await flushPromises();
    await container.instance().componentDidMount();
    container.unmount();

    expect(mockOff.mock.calls.length).toBe(mockOn.mock.calls.length);

    for (const instance of mockOn.mock.instances) {
      expect(mockOff.mock.instances).toContain(instance);
    }
  });

  it('should remove the BaseStore listeners when plugins are disabled', async () => {
    config.update({
      search: {},
      pagination: {},
      columns: ['Name', 'Phone Number'],
      sort: false,
    });

    const mockOn = jest.spyOn(BaseStore.prototype, 'on');
    const mockOff = jest.spyOn(BaseStore.prototype, 'off');

    const container = mount(<Container config={config} />);

    await flushPromises();
    await container.instance().componentDidMount();
    container.unmount();

    expect(mockOff.mock.calls.length).toBe(mockOn.mock.calls.length);

    for (const instance of mockOn.mock.instances) {
      expect(mockOff.mock.instances).toContain(instance);
    }
  });

  it('should unregister the processors', async () => {
    config.update({
      pagination: {},
      search: {},
      columns: ['Name', 'Phone Number'],
      sort: true,
    });

    config.header = Header.fromUserConfig({
      columns: ['Name', 'Phone Number'],
      sort: true,
    });

    const mockRegister = jest.fn();
    const mockUnregister = jest.fn();

    config.pipeline.register = mockRegister;
    config.pipeline.unregister = mockUnregister;

    const container = mount(<Container config={config} />);

    return flushPromises().then(async () => {
      await container.instance().componentDidMount();
      container.unmount();
      expect(mockUnregister.mock.calls.length).toBe(
        mockRegister.mock.calls.length,
      );
    });
  });
});
