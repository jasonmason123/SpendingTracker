// DetailsFragment.java
// Displays one contact's details
package vn.edu.fpt.spendingtracker_mobile;

import android.app.Activity;

import androidx.fragment.app.Fragment;

import android.database.Cursor;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import vn.edu.fpt.spendingtracker_mobile.dialog_fragment.ConfirmDeleteDialogFragment;

public class DetailsFragment extends Fragment
{
    // callback methods implemented by MainActivity
    public interface DetailsFragmentListener
    {
        // called when a transaction is deleted
        public void onTransactionDeleted();

        // called to pass Bundle of transaction's info for editing
        public void onEditTransaction(Bundle arguments);
    }

    private DetailsFragmentListener listener;

    private long rowID = -1; // selected contact's rowID
    private TextView descriptionTextView; // displays transaction's description
    private TextView merchantTextView; // displays transaction's merchant
    private TextView dateTextView; // displays transaction's date
    private TextView amountTextView; // displays transaction's amount
    private TextView transactionTypeTextView; // displays transaction type

    // set DetailsFragmentListener when fragment attached
    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (DetailsFragmentListener) activity;
    }

    // remove DetailsFragmentListener when fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    // called when DetailsFragmentListener's view needs to be created
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        super.onCreateView(inflater, container, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes

        // if DetailsFragment is being restored, get saved row ID
        if (savedInstanceState != null)
            rowID = savedInstanceState.getLong(MainActivity.ROW_ID);
        else
        {
            // get Bundle of arguments then extract the contact's row ID
            Bundle arguments = getArguments();

            if (arguments != null)
                rowID = arguments.getLong(MainActivity.ROW_ID);
        }

        // inflate DetailsFragment's layout
        View view =
                inflater.inflate(R.layout.fragment_details, container, false);
        setHasOptionsMenu(true); // this fragment has menu items to display

        // get the EditTexts
        descriptionTextView = (TextView) view.findViewById(R.id.descriptionTextView);
        merchantTextView = (TextView) view.findViewById(R.id.merchantTextView);
        dateTextView = (TextView) view.findViewById(R.id.dateTextView);
        amountTextView = (TextView) view.findViewById(R.id.amountTextView);
        transactionTypeTextView = (TextView) view.findViewById(R.id.transactionTypeTextView);
        return view;
    }

    // called when the DetailsFragment resumes
    @Override
    public void onResume()
    {
        super.onResume();
        new LoadContactTask().execute(rowID); // load contact at rowID
    }

    // save currently displayed contact's row ID
    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putLong(MainActivity.ROW_ID, rowID);
    }

    // display this fragment's menu items
    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater)
    {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.fragment_details_menu, menu);
    }

    // handle menu item selections
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        int itemId = item.getItemId();
        if(itemId == R.id.action_edit) {
            // create Bundle containing contact data to edit
            Bundle arguments = new Bundle();
            arguments.putLong(MainActivity.ROW_ID, rowID);
            arguments.putCharSequence("description", descriptionTextView.getText());
            arguments.putCharSequence("merchant", merchantTextView.getText());
            arguments.putCharSequence("date", dateTextView.getText());
            arguments.putCharSequence("amount", amountTextView.getText());
            arguments.putCharSequence("transactionType", transactionTypeTextView.getText());
            listener.onEditTransaction(arguments); // pass Bundle to listener
            return true;
        }
        if(itemId == R.id.action_delete) {
            deleteContact();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    // performs database query outside GUI thread
    private class LoadContactTask extends AsyncTask<Long, Object, Cursor>
    {
        SQLiteConnector sqLiteConnector =
                new SQLiteConnector(getActivity());

        // open database & get Cursor representing specified contact's data
        @Override
        protected Cursor doInBackground(Long... params)
        {
            sqLiteConnector.open();
            return sqLiteConnector.getOneTransaction(params[0]);
        }

        // use the Cursor returned from the doInBackground method
        @Override
        protected void onPostExecute(Cursor result)
        {
            super.onPostExecute(result);
            result.moveToFirst(); // move to the first item

            // get the column index for each data item
            int descriptionIndex = result.getColumnIndex("description");
            int merchantIndex = result.getColumnIndex("merchant");
            int dateIndex = result.getColumnIndex("date");
            int amountIndex = result.getColumnIndex("amount");
            int transactionTypeIndex = result.getColumnIndex("transactionType");

            // fill TextViews with the retrieved data
            descriptionTextView.setText(result.getString(descriptionIndex));
            merchantTextView.setText(result.getString(merchantIndex));
            dateTextView.setText(result.getString(dateIndex));
            amountTextView.setText(result.getString(amountIndex));
            transactionTypeTextView.setText(result.getString(transactionTypeIndex));

            result.close(); // close the result cursor
            sqLiteConnector.close(); // close database connection
        } // end method onPostExecute
    } // end class LoadContactTask

    // delete a contact
    private void deleteContact()
    {
        // use FragmentManager to display the confirmDelete DialogFragment
        ConfirmDeleteDialogFragment dialog = ConfirmDeleteDialogFragment.newInstance(rowID);
        dialog.setListener(this.listener);
        dialog.show(getParentFragmentManager(), "confirmDelete");
    }
} // end class DetailsFragment