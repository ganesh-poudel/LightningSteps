public with sharing class CustomShoeController {
  /**create wrapper class coz different types of data need to pass for query */
  public class Filters {
    @AuraEnabled
    public String searchKey { get; set; }
    @AuraEnabled
    public Decimal maxPrice { get; set; }
    @AuraEnabled
    public String[] categories { get; set; }
    @AuraEnabled
    public String[] types { get; set; }
  }

  @AuraEnabled(Cacheable=true)
  public static List<Shoe__c> viewAllShoes(Filters filters) {
    String key, whereClause = '';
    Decimal maxPrice;
    String[] categories, types, criteria = new List<String>{};
    if (filters != null) {
      maxPrice = filters.maxPrice;
      categories = filters.categories;
      types = filters.types;

      if (!String.isEmpty(filters.searchKey)) {
        key = '%' + filters.searchKey + '%';
        criteria.add('Name LIKE :key');
      }
      if (filters.maxPrice >= 0) {
        criteria.add('Price__c <=:maxPrice');
      }
      if (filters.categories != null) {
        criteria.add('Category__c IN :categories');
      }
      if (filters.types != null) {
        criteria.add('Type__c IN :types');
      }
      if (criteria.size() > 0) {
        whereClause = ' WHERE ' + String.join(criteria, ' AND ');
      }
    }
    String query =
      'SELECT Id, Name, Price__c,  Brand__c, Category__c, Picture_URL__c, Material__c, Size__c, Color__c, Type__c FROM Shoe__c ' +
      whereClause +
      ' WITH SECURITY_ENFORCED ORDER BY Name';
    return Database.query(query);
  }

  @AuraEnabled
  public static void orderItem(String items, Decimal totalPrice, Integer totalProduct) {
    // Create order
    Id userId = UserInfo.getUserId(); // get user Id
    String name = UserInfo.getName();
    Datetime now = system.now();
    User userInfo = [
      SELECT Street, City, PostalCode, Country
      FROM User
      WHERE Id = :userId
    ];

    String address =
      String.valueOf(userInfo.Street) +
      ' ' +
      String.valueOf(userInfo.PostalCode) +
      ' ' +
      String.valueOf(userInfo.city) +
      ' ' +
      String.valueOf(userInfo.Country);

    ShoeOrder__c shoeOrder = new ShoeOrder__c(
      Customer__c = name,
      OrderDate__c = now,
      Address__c = address,
      Total_Amount__c = totalPrice,
      Quantity__c = totalProduct
    );
    insert shoeOrder;

    Id shoeOrderId = shoeOrder.Id;
    system.debug(shoeOrderId);

    // Create OrderItem

    list<OrderItem__c> orders = (list<OrderItem__c>) JSON.deserialize(
      items,
      list<OrderItem__c>.class
    );
    for (OrderItem__c itemOrder : orders) {
      itemOrder.ShoeOrder__c = shoeOrderId;
    }
    insert orders;
    system.debug(orders);
  }

  @AuraEnabled(Cacheable=true)
  public static Shoe__c[] getSimilarShoes(Id shoeId, String[] type) {
    return [
      SELECT
        Id,
        Name,
        Price__c,
        Brand__c,
        Category__c,
        Picture_URL__c,
        Material__c,
        Size__c,
        Color__c,
        Type__c
      FROM Shoe__c
      WHERE Type__c IN :type AND Id != :shoeId
      LIMIT 5
    ];
  }
}

//00509000007hmFlAAI
// 00e09000003vAddAAE

