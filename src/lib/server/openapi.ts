import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { PaymentCreatePayloadSchema, PaymentResponseSchema } from './validators';
import * as fs from 'fs';
import * as path from 'path';

export function generateOpenAPI() {
  const registry = new OpenAPIRegistry();
  
  registry.registerPath({
    path: '/api/v1/payments',
    method: 'post',
    summary: 'Create a new payment',
    description: 'Initialize a payment transaction. Use provider "moncash" or "natcash" to direct to a specific provider, or "kobara" (default) for the unified checkout page where the customer chooses.',
    tags: ['Payments'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: PaymentCreatePayloadSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Payment successfully initialized',
        content: {
          'application/json': {
            schema: PaymentResponseSchema,
          },
        },
      },
      '400': {
        description: 'Bad request (Validation error)'
      },
      '401': {
        description: 'Unauthorized'
      }
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Kobara API',
      description: 'The API for integrating MonCash payments via Kobara.',
    },
    servers: [{ url: 'https://api.kobara.app' }],
  });

  const outputPath = path.join(process.cwd(), 'public', 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`OpenAPI document generated at ${outputPath}`);
}

// Automatically generate if script is run directly
if (require.main === module) {
  generateOpenAPI();
}
