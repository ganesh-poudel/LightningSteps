trigger OrderItemDelete on OrderItem__c (before delete) {
    for(OrderItem__c ordItm: Trigger.old){
        if(ordItm.ShoeOrder__c != NULL){
            ordItm.addError('You cannot delete this OrderItem as it is associated to ShoeOrders !!!!!!');
        }
    }
}