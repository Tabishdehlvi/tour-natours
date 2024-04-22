import axios from 'axios';

import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    window.location.replace(response.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
