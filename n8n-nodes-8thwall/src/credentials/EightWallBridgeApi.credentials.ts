import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class EightWallBridgeApi implements ICredentialType {
  name = 'eightWallBridgeApi';
  displayName = '8th Wall MCP Bridge API';
  documentationUrl = '';
  // Simple connectivity test against /tools
  // n8n will call this from the credentials UI
  test = {
    request: {
      method: 'GET',
      url: '={{$credentials.baseUrl}}/tools',
    },
  } as any;
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://127.0.0.1:8787',
      placeholder: 'http://127.0.0.1:8787',
      description: 'Base URL of the MCP HTTP bridge',
    },
  ];
}
