import axios from 'axios';

import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  console.log('check trigger of booker');
  try {
    // 1) Get checkout session from API
    const response = await axios(
      `http://127.0.0.1:4000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log('checkout url', response.data.session.id);

    window.location.replace(response.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
