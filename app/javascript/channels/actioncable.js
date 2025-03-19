import { createConsumer } from "@rails/actioncable";

window.App = {
  cable: createConsumer()
};
