// ContactListFragment.java
// Displays the list of contact names
package vn.edu.fpt.spendingtracker_mobile;

import android.app.Activity;
import androidx.fragment.app.ListFragment;
import android.database.Cursor;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.CursorAdapter;
import android.widget.ListView;
import android.widget.SimpleCursorAdapter;

public class TransactionListFragment extends ListFragment
{
    // callback methods implemented by MainActivity
    public interface TransactionListFragmentListener
    {
        // called when user selects a contact
        public void onTransactionSelected(long rowID);

        // called when user decides to add a contact
        public void onAddTransaction();
    }

    private TransactionListFragmentListener listener;

    private ListView transactionListView; // the ListActivity's ListView
    private CursorAdapter transactionAdapter; // adapter for ListView

    // set ContactListFragmentListener when fragment attached
    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (TransactionListFragmentListener) activity;
    }

    // remove ContactListFragmentListener when Fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    // called after View is created
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState)
    {
        super.onViewCreated(view, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes
        setHasOptionsMenu(true); // this fragment has menu items to display

        // set text to display when there are no contacts
        setEmptyText(getResources().getString(R.string.no_transactions));

        // get ListView reference and configure ListView
        transactionListView = getListView();
        transactionListView.setOnItemClickListener(viewTransactionListener);
        transactionListView.setChoiceMode(ListView.CHOICE_MODE_SINGLE);

        // map each contact's name to a TextView in the ListView layout
        String[] from = new String[] { "description", "amount", "date" };
        int[] to = new int[] { android.R.id.text1 };
        transactionAdapter = new SimpleCursorAdapter(getActivity(),
                android.R.layout.simple_list_item_1, null, from, to, 0);
        setListAdapter(transactionAdapter); // set adapter that supplies data
    }

    // responds to the user touching a contact's name in the ListView
    OnItemClickListener viewTransactionListener = new OnItemClickListener()
    {
        @Override
        public void onItemClick(AdapterView<?> parent, View view,
                                int position, long id)
        {
            listener.onTransactionSelected(id); // pass selection to MainActivity
        }
    }; // end viewContactListener

    // when fragment resumes, use a GetContactsTask to load contacts
    @Override
    public void onResume()
    {
        super.onResume();
        new GetContactsTask().execute((Object[]) null);
    }

    // performs database query outside GUI thread
    private class GetContactsTask extends AsyncTask<Object, Object, Cursor>
    {
        SQLiteConnector sqLiteConnector =
                new SQLiteConnector(getActivity());

        // open database and return Cursor for all contacts
        @Override
        protected Cursor doInBackground(Object... params)
        {
            sqLiteConnector.open();
            return sqLiteConnector.getAllTransactions();
        }

        // use the Cursor returned from the doInBackground method
        @Override
        protected void onPostExecute(Cursor result)
        {
            transactionAdapter.changeCursor(result); // set the adapter's Cursor
            sqLiteConnector.close();
        }
    } // end class GetContactsTask

    // when fragment stops, close Cursor and remove from contactAdapter
    @Override
    public void onStop()
    {
        Cursor cursor = transactionAdapter.getCursor(); // get current Cursor
        transactionAdapter.changeCursor(null); // adapter now has no Cursor

        if (cursor != null)
            cursor.close(); // release the Cursor's resources

        super.onStop();
    }

    // display this fragment's menu items
    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater)
    {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.fragment_transaction_list_menu, menu);
    }

    // handle choice from options menu
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        int itemId = item.getItemId();
        if(itemId == R.id.action_add) {
            listener.onAddTransaction();
            return true;
        }

        return super.onOptionsItemSelected(item); // call super's method
    }

    // update data set
    public void updateTransactionList()
    {
        new GetContactsTask().execute((Object[]) null);
    }
} // end class TransactionListFragment
