import { LightningElement, wire } from "lwc";

// shoe__c Schema
import SHOE_OBJECT from "@salesforce/schema/Shoe__c";
import BRAND_FIELD from "@salesforce/schema/Shoe__c.Brand__c";
import NAME_FIELD from "@salesforce/schema/Shoe__c.Name";
import COLOR_FIELD from "@salesforce/schema/Shoe__c.Color__c";
import PICTURE_URL_FIELD from "@salesforce/schema/Shoe__c.Picture_URL__c";
// LMS
import {
  subscribe,
  MessageContext,
  unsubscribe
} from "lightning/messageService";
import SHOE_SELECTED_MESSAGE from "@salesforce/messageChannel/ShoeSelected__c";

// this function is used to extract field values
import { getFieldValue } from "lightning/uiRecordApi";

export default class CustomShoeCard extends LightningElement {
  // exposing field to make them available in the template
  brand = BRAND_FIELD;
  name = NAME_FIELD;
  color = COLOR_FIELD;
  recordId;
  shoeListSubscription;

  //shoe fields displayed with specific format
  brandName;
  shoeName;
  shoePictureUrl;

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
  }


  handleRecordLoaded(event) {
    const recordData = event.detail.records[this.recordId];
    this.shoePictureUrl = getFieldValue(recordData, PICTURE_URL_FIELD);
    this.shoeName = getFieldValue(recordData, NAME_FIELD);
    this.brandName = getFieldValue(recordData, BRAND_FIELD);
  }

  disconnectedCallback() {
    unsubscribe(this.shoeSelectionSubscription);
    this.shoeSelectionSubscription = null;
  }
}
