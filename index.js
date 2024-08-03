const fs = require('fs');
const stringSimilarity = require("string-similarity");
const _ = require('lodash');
const Anthropic = require("@anthropic-ai/sdk");
require('dotenv').config()

const anthropic = new Anthropic();

const banks = JSON.parse(fs.readFileSync('third-party-banks.json', 'utf8'));

const customers = JSON.parse(fs.readFileSync('bankury-customers.json', 'utf8'));

customerByCompanyId = _.keyBy(customers, c => c.companyId);

const getAiSimilarity = async (bank, customer) => {
    const response = await anthropic.messages.create({
        system: 'You are an expert in determining the similarity score between a bank account and a customer account. You only respond in JSON with the format {similarityScore: number} without any pretext, or other text.',
        messages: [{ role: "user", content: `Determine the similarity between the following bank <bank>${JSON.stringify(bank)}</bank> and <customer> ${JSON.stringify(customer)}</customer>` }],
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 100,
    });

    return JSON.parse(response.content[0].text)?.similarityScore ?? 0;
}

const MATCH_THRESHOLD = 0.5;

let matches = 0;

const getSimilarity = async () => {
    for (const bank of banks) {
        const customer = customerByCompanyId[bank.companyId];

        const nameSimilarity = getNameSimilarity(customer, bank);
        const emailSimilarity = getEmailSimilarity(customer, bank);
        const phonesSimilarity = getPhoneSimilarity(bank, customer);

        const meanDataSimilarity = _.mean([nameSimilarity, emailSimilarity, phonesSimilarity]);

        const aiSimilarity = await getAiSimilarity(_.omit(bank, ['bankuryFraudTeamComments', 'isFraud']), customer);

        const score = _.mean([meanDataSimilarity, aiSimilarity]);

        const isMatch = score >= MATCH_THRESHOLD;
        console.log(`Link: ${bank.linkId}`, score, isMatch ? 'Match' : 'Mismatch');

        if (isMatch) matches++;
    };

    console.log(`Matches: ${matches} \nMismatches: ${banks.length - matches}`);
};

getSimilarity();
function getPhoneSimilarity(bank, customer) {
    return bank.phoneNumbers.length > 0
        ? (stringSimilarity.findBestMatch(customer.contactPhoneNumber, bank.phoneNumbers).bestMatch?.rating ?? 0)
        : 0;
}

function getEmailSimilarity(customer, bank) {
    const emails = customer.users.map(u => u.email).concat(customer.contactEmail);
    const emailSimilarity = _.max(bank.emails.map(email => {
        const similarity = stringSimilarity.findBestMatch(email, emails);

        return similarity.bestMatch?.rating ?? 0;
    })) ?? 0;
    return emailSimilarity;
}

function getNameSimilarity(customer, bank) {
    const names = customer.users.map(u => `${u.firstName} ${u.lastName}`).concat([customer.tradeName, customer.legalName]);
    const nameSimilarity = _.max(bank.names.map(name => {
        const similarity = stringSimilarity.findBestMatch(name, names);

        return similarity.bestMatch?.rating ?? 0;
    })) ?? 0;
    return nameSimilarity;
}

