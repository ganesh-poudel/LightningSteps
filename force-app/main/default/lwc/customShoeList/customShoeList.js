import { LightningElement, wire, track } from "lwc";
import viewAllShoes from "@salesforce/apex/CustomShoeController.viewAllShoes";
import getSimilarShoes from "@salesforce/apex/CustomShoeController.getSimilarShoes";

// import lMS
import { publish, MessageContext, subscribe } from "lightning/messageService";
import SHOE_FILTERED_MESSAGE from "@salesforce/messageChannel/ShoeFilter__c";

import SHOE_SELECTED_MESSAGE from "@salesforce/messageChannel/ShoeSelected__c";
import SHOE_ADDED_MESSAGE from "@salesforce/messageChannel/ShoeAdded__c";
import SHOE_FAVOURITE_MESSAGE from "@salesforce/messageChannel/ShoeFavourite__c";

export default class CustomShoeList extends LightningElement {
  allShoes = [];
  filters = {};

  /**Load context for LMS  create a MessageContext M  Returns a MessageContext object.*/
  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.subscribeHandler();
  }

  subscribeHandler() {
    subscribe(this.messageContext, SHOE_FILTERED_MESSAGE, (message) =>
      this.handleFilterChanges(message)
    );
  }
  handleFilterChanges(message) {
    console.log(message.filters);
    this.filters = { ...message.filters };
    console.log(this.filters);
  }

  /** apex method */
  @wire(viewAllShoes, { filters: "$filters" })
  handleViewAllShoes({ data, error }) {
    if (data) {
      this.allShoes = data;
      console.log(data);
    }
  }

  handleShoeSelected(event) {
    console.log("selected shoe Id", event.detail);
    publish(this.messageContext, SHOE_SELECTED_MESSAGE, {
      shoeId: event.detail.Id,
      Type__c: event.detail.Type__c
    });
  }

  handleShoeAdded(event) {
    console.log("Added shoe Id", event.detail.Id);
    publish(this.messageContext, SHOE_ADDED_MESSAGE, {
      Shoe__c: event.detail.Id,
      Brand__c: event.detail.Brand__c,
      Price__c: event.detail.Price__c,
      Picture_URL__c: event.detail.Picture_URL__c,
      Name: event.detail.Name
    });
  }

  handleFavouriteShoe(event) {
    console.log("Added shoe favourite", event.detail);
    publish(this.messageContext, SHOE_FAVOURITE_MESSAGE, {
      Name: event.detail.Name,
      Shoe__c: event.detail.Id,
      Brand__c: event.detail.Brand__c,
      Price__c: event.detail.Price__c,
      Picture_URL__c: event.detail.Picture_URL__c
    });
  }
}
