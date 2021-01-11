export default class LoadingMessages {
  static messages: string[] = [
    "Spinning the hamster wheel... 🐹",
    "Generating witty dialog... 🤖",
    "Spinning the Bitcoin wheel of fortune... 💸",
    "Twiddling our thumbs... 👍",
    "Definitely not a virus... 🦠",
    "Fetching more code monkeys... 🐒",
  ];

  // Fetch a message at random
  getRandom() {
    return LoadingMessages.messages[
      Math.floor(Math.random() * LoadingMessages.messages.length)
    ];
  }
}
