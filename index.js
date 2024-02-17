const {
    connectToEmail,
    prepareAttachments,
    saveAttachments
} = require('./utils');

const run = async () => {
    try {
        const connection = await connectToEmail();
        await connection.openBox('INBOX');

        const searchCriteria = [
            'UNSEEN',
            // ['SINCE', new Date('2024-02-14')],
            // ['BEFORE', new Date('2024-02-15')],
            // ['FROM', '<some email>']
        ];

        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
            struct: true,
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        const attachments = await prepareAttachments(connection, messages);
        const attachmentsData = await Promise.all(attachments);

        saveAttachments(attachmentsData);

        // mark as read after saving attachments
        for (let message of messages) {
            await connection.addFlags(message.attributes.uid, ['\\Seen']);
        }

        connection.end();

    } catch (error) {
        console.error('Error connecting to email: ', error);
    }
}

run();