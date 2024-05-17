exports.generateEmailBody = (template, user, list) => {
    let emailBody = template;

    const cityFallback = list.properties.find(prop => prop.title === 'city')?.fallbackValue || '';
    const city = user.city || cityFallback;

    emailBody = emailBody.replace('[name]', user.name)
                         .replace('[email]', user.email)
                         .replace('[city]', city);

    emailBody += `<br><br><a href="${process.env.DOMAIN}/api/emails/unsubscribe/${user._id}">Unsubscribe</a>`;
    return emailBody;
};
