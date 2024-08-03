# Fraud Detection: Account Linking Verification

Bankury customers can transfer in funds from their existing bank accounts. They can do this using an inter-bank system called ACH.

The flaw in ACH is that it allows a bank to pull money from an account at another bank without requesting the account holder's permission, so it is important for Bankury to know that the customer has legitimate rights to both accounts involved in the transfer.

To mitigate the risk of unauthorized transfers, Bankury uses a service called Plaid, to which the customer provides a username and password for the opposing bank account. Plaid checks these credentials with the other bank, and if they're valid, we allow the customer to transfer funds. Almost all of the time, this works just fine.

But with only this safeguard, someone can still link a third-party bank account using stolen credentials and draw money from it. We'd like to further curtail the risk.

Plaid provides us with some data about the third-party bank account and its legitimate user(s). We can compare this against our own data about the customer. A mismatch between these does not necessarily indicate fraud, but our fraud team may want to take a closer look in such cases.

Here's an example of data Bankury has:

```json
{
  "companyId": 1,
  "users": [
    { "firstName": "John", "lastName": "Smith", "email": "john@example.com" }
  ],
  "tradeName": "InfoLinks",
  "legalName": "InfoLinks Technologies, Inc.",
  "contactEmail": "contact@infolinks.com",
  "contactPhoneNumber": "5557609870"
}
```

You can assume all fields will be present and that there will be at least one user.

Here's an example of data we get from the third-party bank:

```json
{
  "companyId": 1, // The Bankury customer company that linked the account
  "bank": "Chase", // The third party bank name
  "linkId": 1, // Unique identifier for the link
  "names": ["John B. Smith", "InfoLinks Technologies"],
  "emails": ["john@example.com", "alice@example.com"],
  "phoneNumbers": ["(555)-760-9870"],
  "bankuryFraudTeamComments": "The user and company names match, as does the phone number. Looks like a clear match."
}
```

You can assume this JSON structure will be the same, but the names, emails, and phone numbers might be empty arrays.

In the attached files (bankury-customers.json, third-party-banks.json), there is a complete list of data.

Your job is to go through each linked account, and see if the data there matches the data in the corresponding Bankury account. The shape of the third-party data doesn't exactly match Bankury's, so you'll have to handle the small inconsistencies in a general way.

To help give you guidance on what should be considered a match, the fraud team has added their comments to each linked third-party bank account in the field `bankuryFraudTeamComments`. These are not meant to be considered by your code, as it will have to run on new and unreviewed inputs, but reading over them will help you understand how the fraud team thinks about this data.

The exact approach is up to you. Curiosity about the problem and its context are encouraged. A solution should at least:

- Use all of the data available (name, phone, and email)
- Develop a method to handle slight inconsistencies in name matching.

Print the results you get in this format:

```
Total matches: X
Total mismatches: Y

Link 1: Match
Link 2: Mismatch
Link 3: Match
(Etc.)
```

### Further improvements

If you have time, try these additional improvements:

- Think of additional edge cases that aren't present in this data set, but you think could exist. Write them down along with the ones you've already handled.
- Use the nicknames.txt file to handle name matching with nicknames (e.g. Nick vs Nicholas)
- Propose, or start implementing, a better system for determining a match rather than a yes/no answer.
- Think of other ways to prevent this type of fraud.

## Language/Tools

- Any language is OK. Please don’t feel obligated to use Haskell because that’s what we use at Bankury. You should use the language you are most comfortable with, normally whatever you use in your day job right now.
- Any libraries are OK
- Feel free to Google stuff and use Stackoverflow

## Quality

- Focus on getting a good solution to the problem with readable code
- No need for tests or great error handling

## Duration

- Spend two hours on this. After that period, you and your interviewer can rejoin the Zoom call, and you can explain your code.

## Notes:

1. Think of additional edge cases:
   data normalization
   naming order: John Smith vs Smith John

2. Use the nicknames.txt file to handle name matching with nicknames (e.g. Nick vs Nicholas)
   The `getAiSimilarity` should be able handle this

3. Propose, or start implementing, a better system for determining a match rather than a yes/no answer.
   Instead of `boolean` we can return a `number` between 0 and 1 that represents the similarity between the two accounts. We can use a threshold to determine if the two accounts are a match or inconclusive otherwise. ex: 0 - 0.4 = mismatch | 0.4 - 0.6 = inconclusive | 0.6 - 1 = match

4. Think of other ways to prevent this type of fraud.
   Use 2f/mobile authentication flow: send the bank account number an sms with a verification code and check if the code is correct.
   Micro transactions: send small amounts of money to the bank account and check if the money is gone.
   Using ACH Pre-note to check is the bank is valid & possible to withdraw money.
