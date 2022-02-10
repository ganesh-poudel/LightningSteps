import { LightningElement, wire } from "lwc";
/**Import wire adapetors to fetch picklist values */
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import SHOE_OBJECT from "@salesforce/schema/Shoe__c";

/** import shoes fields for pickList  */
import CATEGORY_FIELD from "@salesforce/schema/Shoe__c.Category__c";
import TYPE_FIELD from "@salesforce/schema/Shoe__c.Type__c";

/**lightning Message Service and a messageChannel*/
import { publish, MessageContext } from "lightning/messageService";
import SHOE_FILTERED_MESSAGE from "@salesforce/messageChannel/ShoeFilter__c";

const CATEGORY_ERROR = "Error loaging categories";
const TYPE_ERROR = "Error loaging brand";

export default class CustomShoeFilter extends LightningElement {
  filters = {
    searchKey: "",
    maxPrice: 200
  };
  categoryError = CATEGORY_ERROR;
  typeError = TYPE_ERROR;
  timer;

  /**onload =>  call wire adapter (getObjectInfo and store into carObjectInfo property) */
  @wire(getObjectInfo, { objectApiName: SHOE_OBJECT })
  shoeObjectInfo;

  /**fetching category picklist value */
  @wire(getPicklistValues, {
    recordTypeId: "$shoeObjectInfo.data.defaultRecordTypeId",
    fieldApiName: CATEGORY_FIELD
  })
  categories;

  /**fetching Type picklist */
  /**once carObjectInfo aviliable call getPicklistValues wire adapter  */
  @wire(getPicklistValues, {
    recordTypeId: "$shoeObjectInfo.data.defaultRecordTypeId",
    fieldApiName: TYPE_FIELD
  })
  types;

  /**search key handler */
  handleSearchKeyChange(event) {
    console.log(event.target.value);
    /** mutate the object  */
    //this.filters.searchKey = event.target.value
    /** unmutate the object  */
    this.filters = { ...this.filters, searchKey: event.target.value };
    this.sendDataToShoeList();
  }

  /**price range handler */
  handleMaxPriceChange(event) {
    this.filters = { ...this.filters, maxPrice: event.target.value };
    this.sendDataToShoeList();
  }

  /**category check box handler */
  handleCheckbox(event) {
    if (!this.filters.categories) {
      const categories = this.categories.data.values.map((item) => item.value);
      const types = this.types.data.values.map((item) => item.value);
      this.filters = { ...this.filters, categories, types };
    }
    const { name, value } = event.target.dataset;
    // console.log("name", name)
    // console.log("value", value) 2501

    if (event.target.checked) {
      if (!this.filters[name].includes(value)) {
        this.filters[name] = [...this.filters[name], value];
      }
    } else {
      this.filters[name] = this.filters[name].filter((item) => item !== value);
    }
    this.sendDataToShoeList();
  }

  /**Load context for LMS */
  @wire(MessageContext)
  messageContext;

  sendDataToShoeList() {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      publish(this.messageContext, SHOE_FILTERED_MESSAGE, {
        filters: this.filters
      });
    }, 400);
  }
}
