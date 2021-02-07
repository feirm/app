export default class CardGradient {
    // Coins and their 2 logo colours to be used in a gradient
    // Colours should go from dark > light (top to bottom)
    // TODO Fetch this data from an API in future
    private gradients = [
        {
            ticker: "xfe",
            colours: ["#cb4f2b", "#f69738"]
        },
        {
            ticker: "btc",
            colours: ["#ff7e00", "#f7931a"]
        },
        {
            ticker: "doge",
            colours: ["#a17c34", "#e5cb7a"]
        }
    ]

    // Return the assembled linear-gradient string based on the coin ticker
    getGradient(ticker: string): string {
        const lowerTicker = ticker.toLowerCase();

        // Find the appropriate gradient index
        const gradientIndex = this.gradients.map(gradient => gradient.ticker).indexOf(lowerTicker);
        console.log(gradientIndex);

        const gradient = this.gradients[gradientIndex];

        // Return assembled string
        const linearGradient = `linear-gradient(${gradient.colours[0]}, ${gradient.colours[1]})`;
        return linearGradient;
    }
}