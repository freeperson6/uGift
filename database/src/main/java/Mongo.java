//package com.mkyong.core;

import java.net.UnknownHostException;
import java.util.Date;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.MongoClient;
import com.mongodb.MongoException;

public class Mongo {
  public static void main(String[] args) {
	return; 
  }


  public DBCollection queryDb(String[] args) {
    try {

        /**** Connect to MongoDB ****/
        // Since 2.10.0, uses MongoClient
        MongoClient mongo = new MongoClient("localhost", 27017);

        /**** Get database ****/
        // if database doesn't exists, MongoDB will create it for you
        DB db = mongo.getDB("testdb");

        /**** Get collection / table from 'testdb' ****/
        // if collection doesn't exists, MongoDB will create it for you
        DBCollection table = db.getCollection("user");
        return table;
    } catch (UnknownHostException e) {
        e.printStackTrace();
    } catch (MongoException e) {
        e.printStackTrace();
    }
  }

  public void inputData(DBCollection table, String[] args) {
    try{
        /**** Insert ****/
        // create a document to store key and value
        BasicDBObject document = new BasicDBObject();
        document.put("name", "mkyong");
        document.put("age", 30);
        document.put("createdDate", new Date());
        table.insert(document);
    } catch (UnknownHostException e) {
        e.printStackTrace();
    } catch (MongoException e) {
        e.printStackTrace();
    }
  }
  public void searchData(DBCollection table, String[] args) {
    try{
        BasicDBObject searchQuery = new BasicDBObject();
        searchQuery.put("name", "mkyong");

        DBCursor cursor = table.find(searchQuery);

        while (cursor.hasNext()) {
                System.out.println(cursor.next());
        }

    } catch (UnknownHostException e) {
        e.printStackTrace();
    } catch (MongoException e) {
        e.printStackTrace();
    }


  }

  public void searchAndReplaceData(DBCollection table, String[]args){

    try {
        BasicDBObject query = new BasicDBObject();
        query.put("name", "mkyong");

        BasicDBObject newDocument = new BasicDBObject();
        newDocument.put("name", "mkyong-updated");

        BasicDBObject updateObj = new BasicDBObject();
        updateObj.put("$set", newDocument);

        table.update(query, updateObj);
    } catch (UnknownHostException e) {
        e.printStackTrace();
    } catch (MongoException e) {
        e.printStackTrace();
    }

  }

}  
