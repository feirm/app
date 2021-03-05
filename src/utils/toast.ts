import { toastController } from "@ionic/vue"

async function showErrorToast(message: string) {
    // Create a red (danger) toast for 2.5 seconds
    const toast = await toastController.create({
        message,
        color: "danger",
        duration: 2500
    });
    
    return toast.present();
}

export {
    showErrorToast
}