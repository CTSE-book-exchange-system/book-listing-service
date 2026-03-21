const amqp = require('amqplib');

let channel;

async function connect() {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('reread.events', 'topic', { durable: true });
    console.log('RabbitMQ connected');

    conn.on('error', (err) => {
        console.warn('RabbitMQ connection error:', err.message);
        channel = null;
    });

    conn.on('close', () => {
        console.warn('RabbitMQ connection closed');
        channel = null;
    });
}

async function publish(routingKey, data) {
    try {
        if (!channel) await connect();
        channel.publish(
            'reread.events',
            routingKey,
            Buffer.from(JSON.stringify({ ...data, timestamp: new Date().toISOString() }))
        );
        console.log(`Event published: ${routingKey}`, data);
    } catch (err) {
        console.error(`Failed to publish event ${routingKey}:`, err.message);
    }
}

module.exports = { connect, publish };