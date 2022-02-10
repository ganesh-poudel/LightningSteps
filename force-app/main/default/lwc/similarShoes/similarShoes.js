import { LightningElement, wire } from "lwc";
import getSimilarShoes from "@salesforce/apex/CustomShoeController.getSimilarShoes";
// LMS
import {
  subscribe,
  MessageContext,
 
} from "lightning/messageService";
import SHOE_SELECTED_MESSAGE from "@salesforce/messageChannel/ShoeSelected__c";

export default class SimilarShoes extends LightningElement {
     // exposing field to make them available in the template
  allSimilarShoe = [];
 
  type;
  recordId;
  shoeListSubscription;
 
  // subscription reference for shoeSelected
  shoeSelectionSubscription;
 
 
  /**Load context for LMS */
  @wire(MessageContext)
  messageContext;
 
  connectedCallback() {
    this.subscribeHandler();
  }
  subscribeHandler() {
    this.shoeSelectionSubscription = subscribe(
      this.messageContext,
      SHOE_SELECTED_MESSAGE,
      (message) => {
        this.handleShoeSelected(message);
      }
    );
  }
  handleShoeSelected(message) {
    this.recordId = message.shoeId;
    this.type = message.Type__c;
  }

    @wire(getSimilarShoes, { shoeId: "$recordId", type: "$type" })
  handleSimilarShoes({ data, error }) {
    if (data) {
      this.allSimilarShoe = data;
      console.log(data);
    }
  }

}