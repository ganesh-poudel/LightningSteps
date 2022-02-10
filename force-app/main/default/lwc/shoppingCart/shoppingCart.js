import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import orderItem from "@salesforce/apex/CustomShoeController.orderItem";

/**Import Lms */
import { subscribe, MessageContext } from "lightning/messageService";
import SHOE_ADDED_MESSAGE from "@salesforce/messageChannel/ShoeAdded__c";
import SHOE_FAVOURITE_MESSAGE from "@salesforce/messageChannel/ShoeFavourite__c";

export default class ShoppingCart extends LightningElement {
  shoeAddedSubscription;
  /** get string value for key (sessions) and parse to array of object from the localStorage 
  /** (reason to use localStorage; the stored data is saved across browser sessions )  */
  shoesInCart = JSON.parse(localStorage.getItem("session")) || [];
  shosFavourite = JSON.parse(localStorage.getItem("sessionFav")) || [];
  priceArray = [];
  totalCartPrice = 0.0;
  isModalOpen = false;
  isFavModalOpen = false;
  totalProduct;
  shoesStoredToLocalStorage = [];
  @track error;

  /** this function is trigger when mouse is click in cart image in Shoping Cart component and open the model */
  handleCartItemDetails() {
    this.isModalOpen = !this.isModalOpen;
    /** extract all price value from shoesInCart array and store in priceArray    */
    this.priceArray = this.shoesInCart.map((a) => a.Price__c);
    /** this statement give the total count in cart which is assigned in total quantity field in shoeOrder object  */
    this.totalProduct = this.priceArray.length;
    console.log(this.priceArray);
    /** return sum of all the element in priceArray which is assigned in total amount field in shoeOrder object */
    this.totalCartPrice = this.priceArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    this.findQuantity();
    console.log(this.shoesInCart);
  }

  handleCloseModal() {
    this.isModalOpen = !this.isModalOpen;
    console.log(JSON.stringify(this.shoesInCart));
  }

  handleDeleteItem(event) {
    console.log(event.target.dataset);
    /** goes through all the element in shoesInCart and check the condition.  */
    this.shoesInCart = this.shoesInCart.filter(
      (value) => value.Shoe__c !== event.currentTarget.dataset.item
    );
    localStorage.setItem("session", JSON.stringify(this.shoesInCart));
    this.totalCartPrice =
      this.totalCartPrice -
      repeatedTime.length * event.currentTarget.dataset.price;
    console.log(repeatedTime);
  }

  handleProceedToCheckOut() {
    this.isModalOpen = false;
    console.log("test-->" + JSON.stringify(this.shoesInCart));
    orderItem({
      items: JSON.stringify(this.shoesInCart),
      totalPrice: this.totalCartPrice,
      totalProduct: this.totalProduct
    })
      .then((result) => {
        console.log("result" + JSON.stringify(this.result));
        const toastEventOrder = new ShowToastEvent({
          title: "Success!",
          message: "Your Order is created successfull",
          variant: "danger"
        });
        this.dispatchEvent(toastEventOrder);

        const toastEventOrderItem = new ShowToastEvent({
          title: "Success!",
          message: "OrderLineItem is created successfull",
          variant: "success"
        });
        this.dispatchEvent(toastEventOrderItem);
      })
      .catch((error) => {
        this.error = error.message;
      });

    localStorage.removeItem("session");
    this.shoesInCart = [];
  }

  handleFavItemDetails() {
    console.log(this.shosFavourite);
    this.isFavModalOpen = !this.isFavModalOpen;
  }

  handleCloseFavModal() {
    this.isFavModalOpen = !this.isFavModalOpen;
    console.log(JSON.stringify(this.shoesInCart));
  }

  handleDeleteFavItem(event) {
    this.shosFavourite = this.shosFavourite.filter(
      (value) => value.Shoe__c !== event.currentTarget.dataset.item
    );
    localStorage.setItem("sessionFav", JSON.stringify(this.shosFavourite));
  }

  /** Load MessageContext */
  @wire(MessageContext)
  messageContext;

  /**when a component is inserted into the DOM connectedCallback lifecycle hook fires */
  connectedCallback() {
    this.subscribeHandlerAdded();
    this.subscribeHandlerFavourite();
  }

  /**this function call subscribe method and store the value in shoeAddedSubscription */
  /**subscribe method get three parameters messageContext, messageChannel and  callback function  */
  subscribeHandlerAdded() {
    this.shoeAddedSubscription = subscribe(
      this.messageContext,
      SHOE_ADDED_MESSAGE,
      (message) => {
        this.handleShoeAdded(message);
      }
    );
  }

  subscribeHandlerFavourite() {
    this.shoeAddedSubscription = subscribe(
      this.messageContext,
      SHOE_FAVOURITE_MESSAGE,
      (message) => {
        this.handleShoeFavourite(message);
      }
    );
  }

  /** this method get object as a parameter   */
  handleShoeAdded(message) {
    this.totalCartPrice = this.totalCartPrice + message.Price__c;
    console.log(this.shoesInCart);
    this.passDataToLocalStorage(message);
  }

  handleShoeFavourite(message) {
    console.log(this.shoesInCart);
    this.passDataToLocalStorageFavourite(message);
  }

  /*   disconnectedCallback() {
    unsubscribe(this.shoeAddedSubscription);
    this.shoeAddedSubscription = null;
  } */

  passDataToLocalStorage(message) {
    /** add selected shoe object in shoesInCart array */
    this.shoesInCart.push(message);
    /** change shoesInCart array to string and store in local storage as session  */
    localStorage.setItem("session", JSON.stringify(this.shoesInCart));
    /** get string value for key (sessions) and parse to array of object from the localStorage  */
    this.shoesInCart = JSON.parse(localStorage.getItem("session")) || [];
  }

  passDataToLocalStorageFavourite(message) {
    /** add selected shoe object in shoesInCart array */
    this.shosFavourite.push(message);
    /** change shoesInCart array to string and store in local storage as session  */
    localStorage.setItem("sessionFav", JSON.stringify(this.shosFavourite));
    /** get string value for key (sessions) and parse to array of object from the localStorage  */
    this.shosFavourite = JSON.parse(localStorage.getItem("sessionFav")) || [];
  }

  findQuantity() {
    this.shoesInCart.forEach((element) => {
      element["Quantity__c"] = 1;
    });
  }
}
