// MainActivity.java
// Hosts Address Book app's fragments
package vn.edu.fpt.spendingtracker_mobile;

import androidx.fragment.app.FragmentTransaction;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity
implements TransactionListFragment.TransactionListFragmentListener,
        DetailsFragment.DetailsFragmentListener,
        AddEditFragment.AddEditFragmentListener
{
    // keys for storing row ID in Bundle passed to a fragment
    public static final String ROW_ID = "row_id";

    TransactionListFragment transactionListFragment; // displays transaction list

    // display ContactListFragment when MainActivity first loads
    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // return if Activity is being restored, no need to recreate GUI
        if (savedInstanceState != null)
            return;

        // check whether layout contains fragmentContainer (phone layout);
        // ContactListFragment is always displayed
        if (findViewById(R.id.fragmentContainer) != null)
        {
            // create ContactListFragment
            transactionListFragment = new TransactionListFragment();

            // add the fragment to the FrameLayout
            FragmentTransaction transaction =
                    getSupportFragmentManager().beginTransaction();
            transaction.add(R.id.fragmentContainer, transactionListFragment);
            transaction.commit(); // causes ContactListFragment to display
        }
    }

    // called when MainActivity resumes
    @Override
    protected void onResume()
    {
        super.onResume();

        // if contactListFragment is null, activity running on tablet,
        // so get reference from FragmentManager
        if (transactionListFragment == null)
        {
            transactionListFragment =
                    (TransactionListFragment) getSupportFragmentManager().findFragmentById(
                            R.id.transactionListFragment);
        }
    }

    // display DetailsFragment for selected contact
    @Override
    public void onTransactionSelected(long rowID)
    {
        if (findViewById(R.id.fragmentContainer) != null) // phone
            displayTransaction(rowID, R.id.fragmentContainer);
        else // tablet
        {
            getSupportFragmentManager().popBackStack(); // removes top of back stack
            displayTransaction(rowID, R.id.rightPaneContainer);
        }
    }

    // display a contact
    private void displayTransaction(long rowID, int viewID)
    {
        DetailsFragment detailsFragment = new DetailsFragment();

        // specify rowID as an argument to the DetailsFragment
        Bundle arguments = new Bundle();
        arguments.putLong(ROW_ID, rowID);
        detailsFragment.setArguments(arguments);

        // use a FragmentTransaction to display the DetailsFragment
        FragmentTransaction transaction =
                getSupportFragmentManager().beginTransaction();
        transaction.replace(viewID, detailsFragment);
        transaction.addToBackStack(null);
        transaction.commit(); // causes DetailsFragment to display
    }

    // display the AddEditFragment to add a new contact
    @Override
    public void onAddTransaction()
    {
        if (findViewById(R.id.fragmentContainer) != null)
            displayAddEditFragment(R.id.fragmentContainer, null);
        else
            displayAddEditFragment(R.id.rightPaneContainer, null);
    }

    // display fragment for adding a new or editing an existing contact
    private void displayAddEditFragment(int viewID, Bundle arguments)
    {
        AddEditFragment addEditFragment = new AddEditFragment();

        if (arguments != null) // editing existing contact
            addEditFragment.setArguments(arguments);

        // use a FragmentTransaction to display the AddEditFragment
        FragmentTransaction transaction =
                getSupportFragmentManager().beginTransaction();
        transaction.replace(viewID, addEditFragment);
        transaction.addToBackStack(null);
        transaction.commit(); // causes AddEditFragment to display
    }

    // return to contact list when displayed contact deleted
    @Override
    public void onTransactionDeleted()
    {
        getSupportFragmentManager().popBackStack(); // removes top of back stack

        if (findViewById(R.id.fragmentContainer) == null) // tablet
            transactionListFragment.updateTransactionList();
    }

    // display the AddEditFragment to edit an existing contact
    @Override
    public void onEditTransaction(Bundle arguments)
    {
        if (findViewById(R.id.fragmentContainer) != null) // phone
            displayAddEditFragment(R.id.fragmentContainer, arguments);
        else // tablet
            displayAddEditFragment(R.id.rightPaneContainer, arguments);
    }

    // update GUI after new contact or updated contact saved
    @Override
    public void onAddEditCompleted(long rowID)
    {
        // removes top of back stack (returns to previous page)
        getSupportFragmentManager().popBackStack();

        if (findViewById(R.id.fragmentContainer) == null) // tablet
        {
            getSupportFragmentManager().popBackStack(); // removes top of back stack
            transactionListFragment.updateTransactionList(); // refresh contacts

            // on tablet, display contact that was just added or edited
            displayTransaction(rowID, R.id.rightPaneContainer);
        }
    }
}