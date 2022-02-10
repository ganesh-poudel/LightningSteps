import { LightningElement, api } from "lwc";

export default class CustomShoeTile extends LightningElement {
  @api customshoe = {};

  viewHandleClick() {
    this.dispatchEvent(
      new CustomEvent("selected", {
        detail: this.customshoe
      })
    );
  }

  addCartHandleClick() {
    this.dispatchEvent(new CustomEvent("added", { detail: this.customshoe }));
  }

  favouriteHandlerClick() {
 
    this.dispatchEvent(
      new CustomEvent("fav", {
        detail: this.customshoe
      })
    );
  }
}
