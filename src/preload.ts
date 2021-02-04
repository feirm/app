import {
  alertController,
  loadingController
} from "@ionic/vue";
import { store } from "@/store";
import tatsuyaService from "./apiService/tatsuyaService";
import { DecryptContacts, EncryptedContact } from "./lib/contacts";
import axios from "axios";
import LoadingMessages from "./class/loadingMessages";
import hdWalletP2pkh from "./class/wallets/hd-wallet-p2pkh";

export async function preload() {
  // Random loading message
  const wittyLoader = new LoadingMessages();

  // We want to pre-load everything from addresses, transactions etc,
  // and continue to check for new transactions every couple of seconds.
  await loadingController
    .create({
      message: wittyLoader.getRandom(),
    })
    .then((a) => {
      // Show loading popup
      a.present()
        .then(async () => {
          // Fetch coin data from Azure microservice
          await store.dispatch("setCoins");

          // Get the entire coins wallet and available coins
          const wallet = hdWalletP2pkh;
          const ourCoins = wallet.getAllCoins();

          // Fetch balances
          for (let i = 0; i < ourCoins.length; i++) {
            // Make our coin easily accessible
            const coin = ourCoins[i];

            // Get the blockbook instance for our coin
            const blockbookUrl = wallet.getBlockbook(coin.ticker);
              
            // Get the balances using the XPUB
            const xpub = wallet.getXpub(coin.ticker);

            // TESTING WebSocket
            wallet.establishWss(coin.ticker);

            await axios.get(`https://cors-anywhere.feirm.com/${blockbookUrl}/api/v2/xpub/${xpub}`).then(res => {
              // Save balances
              // wallet.setBalance(coin.ticker, res.data.balance); // Confirmed balance
              // wallet.setUnconfirmedBalance(coin.ticker, res.data.unconfirmedBalance) // Unconfirmed balance

              // wallet.saveToDisk();
              // wallet.saveToCache();
            })
          }

          // Fetch and decrypt contacts
          try {
            await tatsuyaService.fetchContacts().then(async (res) => {
              // Set the encrypted contacts array
              const contacts = res.data as EncryptedContact[];
              if (!contacts) {
                return;
              }

              // Attempt to decrypt contacts array
              await DecryptContacts(contacts)
                .then((decryptedContacts) => {
                  store.commit("setContacts", decryptedContacts);
                })
                .catch((e) => {
                  return e;
                });
            });
          } catch (e) {
            return e;
          }

          // Dismiss the modal
          a.dismiss();
        })
        .catch(async (e) => {
          // Dismiss current loading controller
          a.dismiss();

          // Show error alert
          const alert = await alertController.create({
            header: "Error fetching data!",
            message: e,
            buttons: ["Okay!"],
          });

          return alert.present();
        });
    });
}
