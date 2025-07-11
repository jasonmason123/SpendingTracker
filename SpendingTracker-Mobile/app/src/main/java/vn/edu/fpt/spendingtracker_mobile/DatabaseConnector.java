// DatabaseConnector.java
// Provides easy connection and creation of UserContacts database.
package vn.edu.fpt.spendingtracker_mobile;

import static vn.edu.fpt.spendingtracker_mobile.utils.AppConstants.DATABASE_NAME;
import static vn.edu.fpt.spendingtracker_mobile.utils.AppConstants.TRANSACTION_TABLE_NAME;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteDatabase.CursorFactory;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import vn.edu.fpt.spendingtracker_mobile.enums.TransactionTypes;

public class DatabaseConnector
{
    private SQLiteDatabase database; // for interacting with the database
    private DatabaseOpenHelper databaseOpenHelper; // creates the database

    // public constructor for DatabaseConnector
    public DatabaseConnector(Context context)
    {
        // create a new DatabaseOpenHelper
        databaseOpenHelper =
                new DatabaseOpenHelper(context, DATABASE_NAME, null, 1);
    }

    // open the database connection
    public void open() throws SQLException
    {
        // create or open a database for reading/writing
        database = databaseOpenHelper.getWritableDatabase();
    }

    // close the database connection
    public void close()
    {
        if (database != null)
            database.close(); // close the database connection
    }

    // inserts a new transaction in the database
    public long insertTransaction (String description, String merchant, Date date,
                                  double amount, TransactionTypes transactionType)
    {
        //Parse date to yyyy-MM-dd HH:mm:ss string
        SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
        String datetimeString = datetimeFormat.format(date);

        //If EXPENSE and amount is positive -> Set to negative
        //If INCOME and amount is negative -> Set to positive
        if ((transactionType == TransactionTypes.EXPENSE && amount > 0) ||
                (transactionType == TransactionTypes.INCOME && amount < 0))
        {
            amount *= -1;
        }

        ContentValues newTransaction = new ContentValues();
        newTransaction.put("description", description);
        newTransaction.put("merchant", merchant);
        newTransaction.put("date", datetimeString);
        newTransaction.put("amount", amount);
        newTransaction.put("transactionType", transactionType.toString());

        open(); // open the database
        long rowID = database.insert(TRANSACTION_TABLE_NAME, null, newTransaction);
        close(); // close the database
        return rowID;
    }

    // updates an existing transaction in the database
    public void updateTransaction (long id, String description, String merchant,
                                   Date date, double amount, TransactionTypes transactionType)
    {
        //Parse date to yyyy-MM-dd string
        SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        String datetimeString = datetimeFormat.format(date);

        //If EXPENSE and amount is positive -> Set to negative
        //If INCOME and amount is negative -> Set to positive
        if ((transactionType == TransactionTypes.EXPENSE && amount > 0) ||
            (transactionType == TransactionTypes.INCOME && amount < 0))
        {
            amount *= -1;
        }

        ContentValues editTransaction = new ContentValues();
        editTransaction.put("description", description);
        editTransaction.put("date", datetimeString);
        editTransaction.put("amount", amount);

        open(); // open the database
        database.update(TRANSACTION_TABLE_NAME, editTransaction, "_id=" + id, null);
        close(); // close the database
    }

    // return a Cursor with all transactions in the database
    public Cursor getAllTransactions()
    {
        return database.query(TRANSACTION_TABLE_NAME, new String[] {"_id", "description", "amount", "date"},
                null, null, null, null, "date DESC");
    }

    // return a Cursor containing specified transaction's information
    public Cursor getOneTransaction(long id)
    {
        return database.query(TRANSACTION_TABLE_NAME, null,"_id=" + id,
                null, null, null, null);
    }

    // delete the contact specified by the given String name
    public void deleteContact(long id)
    {
        open(); // open the database
        database.delete(TRANSACTION_TABLE_NAME, "_id=" + id, null);
        close(); // close the database
    }

    private class DatabaseOpenHelper extends SQLiteOpenHelper
    {
        // constructor
        public DatabaseOpenHelper(Context context, String name,
                                  CursorFactory factory, int version)
        {
            super(context, name, factory, version);
        }

        // creates the contacts table when the database is created
        @Override
        public void onCreate(SQLiteDatabase db)
        {
            // query to create a new table named contacts
            String createQuery = "CREATE TABLE " + TRANSACTION_TABLE_NAME +
                    "(_id integer primary key autoincrement," +
                    "description TEXT, merchant TEXT, date REAL, " +
                    "amount TEXT, transactionType TEXT);";

            db.execSQL(createQuery); // execute query to create the database
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion,
                              int newVersion)
        {
        }
    } // end class DatabaseOpenHelper
} // end class DatabaseConnector