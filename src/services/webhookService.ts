import axios from 'axios';

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxkaF92WXRrbqjr1a9MHRFiToLizZ70rh8Zn5z_I6ksjUzuDUwoU8H1JEQXjQo5bnWiWA/exec";

export async function sendUserDataToSheet(userData: any) {
  try {
    await axios.post(WEBHOOK_URL, userData);
  } catch (error) {
    console.error("Error sending data to sheet:", error);
  }
}
