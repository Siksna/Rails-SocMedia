import { createConsumer } from "@rails/actioncable";

window.App ||= {};
window.App.cable = createConsumer();
