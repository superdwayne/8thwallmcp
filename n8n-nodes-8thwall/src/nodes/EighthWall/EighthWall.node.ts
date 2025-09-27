/*
  8th Wall MCP Tool — n8n Node
  Invokes tools exposed by the MCP HTTP bridge.
*/

import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

export class EighthWall implements INodeType {
  description: INodeTypeDescription = {
    displayName: '8th Wall MCP Tool',
    name: 'eighthWallMcp',
    icon: 'file:wall.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Call MCP HTTP bridge tools',
    description: 'Invoke tools exposed by the 8th Wall MCP HTTP bridge',
    defaults: { name: '8th Wall MCP' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      { name: 'eightWallBridgeApi', required: true },
    ],
    properties: [
      {
        displayName: 'Tool',
        name: 'tool',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getTools' },
        options: [
          { name: 'health_ping', value: 'health_ping', description: 'Simple health check' },
        ],
        default: 'health_ping',
        required: true,
        description: 'Tool name to invoke',
      },
      {
        displayName: 'JSON Parameters',
        name: 'jsonParameters',
        type: 'boolean',
        default: true,
        description: 'Pass tool arguments as JSON',
      },
      {
        displayName: 'Args (JSON)',
        name: 'argsJson',
        type: 'json',
        default: '{}',
        typeOptions: { rows: 5 },
        displayOptions: { show: { jsonParameters: [true] } },
        description: 'JSON body passed to the tool',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getTools(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const creds = await this.getCredentials('eightWallBridgeApi');
        const baseUrl = String((creds as any).baseUrl || 'http://127.0.0.1:8787').replace(/\/$/, '');
        try {
          const list = await (this.helpers as any).httpRequest({
            method: 'GET',
            url: `${baseUrl}/tools`,
            json: true,
          });
          const options = (list.tools || []).map((t: any) => ({ name: `${t.name}`, value: t.name, description: t.description }));
          return { results: options } as any;
        } catch (e) {
          // Fallback to minimal set
          return { results: [ { name: 'health_ping', value: 'health_ping' } ] } as any;
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('eightWallBridgeApi');
    const baseUrl = String((credentials as any).baseUrl || 'http://127.0.0.1:8787').replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      const tool = this.getNodeParameter('tool', i) as string;
      const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;
      const args = jsonParameters ? (this.getNodeParameter('argsJson', i) as object) : {};

      try {
        const resp = await (this.helpers as any).httpRequest({
          method: 'POST',
          url: `${baseUrl}/tool/${encodeURIComponent(tool)}`,
          body: args,
          json: true,
        });
        const payload = 'result' in resp ? resp.result : resp;
        returnData.push({ json: payload });
      } catch (e: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { ok: false, error: e?.message || String(e) } });
          continue;
        }
        throw e;
      }
    }

    return [returnData];
  }
}
