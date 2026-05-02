import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: '¿Cuál es la capital de Francia?' }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log(text);
}

main().catch(console.error);
