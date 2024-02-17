const imaps = require('imap-simple');
const fs = require('fs');
const path = require('path');

const {
    config
} = require('./config');

const connectToEmail = async () => {
    return await imaps.connect(config);
}

const prepareAttachments = async (connection, messages) => {
    let attachments = [];

    messages.forEach(function (message) {
        var parts = imaps.getParts(message.attributes.struct);
        attachments = attachments.concat(parts.filter(function (part) {
            return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
        }).map(function (part) {
            return connection.getPartData(message, part)
                .then(function (partData) {
                    return {
                        filename: part.disposition.params.filename,
                        data: partData
                    };
                });
        }));
    });

    return attachments;
}

const saveAttachments = async (attachmentsData) => {
    const directory = './attachments';

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    attachmentsData.forEach(attachment => {
        const filePath = path.join(directory, attachment.filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase());
        fs.writeFileSync(filePath, attachment.data);
    });
}

module.exports = {
    connectToEmail,
    prepareAttachments,
    saveAttachments,
}