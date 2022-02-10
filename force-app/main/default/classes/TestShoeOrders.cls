public class TestShoeOrders implements Database.Batchable<sObject> {
  String status = 'Fulfilling';
  public Database.QueryLocator start(
    Database.BatchableContext batchableContext
  ) {
    return Database.getQueryLocator(
      'SELECT Id,  toLabel(Status__c) from ShoeOrder__c WHERE toLabel(Status__c) = :status AND  OrderDate__c = LAST_YEAR'
    );
  }
  public void execute(
    Database.BatchableContext batchableContext,
    List<ShoeOrder__c> shoeOrders
  ) {
    for (ShoeOrder__c shoeOrder : shoeOrders) {
      
      shoeOrder.Order_Complete__c = true;
    }
    update shoeOrders;
  }

  public void finish(Database.BatchableContext batchableContext) {
    // * Execute a final operation once the batch is complete
  }
}
