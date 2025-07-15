// MainActivity.java
// Hosts Address Book app's fragments
package vn.edu.fpt.spendingtracker_mobile;

import androidx.fragment.app.FragmentTransaction;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import vn.edu.fpt.spendingtracker_mobile.fragments.AddEditFragment;
import vn.edu.fpt.spendingtracker_mobile.fragments.DetailsFragment;
import vn.edu.fpt.spendingtracker_mobile.fragments.LoginFragment;
import vn.edu.fpt.spendingtracker_mobile.fragments.TransactionListFragment;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class MainActivity extends AppCompatActivity
implements TransactionListFragment.TransactionListFragmentListener,
        DetailsFragment.DetailsFragmentListener,
        AddEditFragment.AddEditFragmentListener,
        LoginFragment.LoginFragmentListener
{
    // keys for storing row ID in Bundle passed to a fragment
    public static final String TRANSACTION_ID = "transaction_id";

    TransactionListFragment transactionListFragment; // displays transaction list
    LoginFragment loginFragment;

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
            // add the fragment to the FrameLayout
            FragmentTransaction transaction =
                    getSupportFragmentManager().beginTransaction();
            SharedPreferences prefs =
                    getSharedPreferences(AppConstants.AUTH_PREFERENCE_NAME, Context.MODE_PRIVATE);
            if(prefs.getString(AppConstants.AUTH_TOKEN_NAME, null) == null) {
                transaction.add(R.id.fragmentContainer, new LoginFragment());
            } else {
                transaction.add(R.id.fragmentContainer, new TransactionListFragment());
            }
            transaction.commit(); // causes Fragment to display
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
    public void onTransactionSelected(long transactionId)
    {
        if (findViewById(R.id.fragmentContainer) != null) // phone
        {
            //getSupportFragmentManager().popBackStack(); // removes top of back stack
            displayTransaction(transactionId, R.id.fragmentContainer);
        }
        else // tablet
        {
            getSupportFragmentManager().popBackStack(); // removes top of back stack
            displayTransaction(transactionId, R.id.rightPaneContainer);
        }
    }

    // display a contact
    private void displayTransaction(long transactionId, int viewID)
    {
        DetailsFragment detailsFragment = new DetailsFragment();

        // specify rowID as an argument to the DetailsFragment
        Bundle arguments = new Bundle();
        arguments.putLong(TRANSACTION_ID, transactionId);
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

    @Override
    public void onLoginCompleted(String authToken) {
        SharedPreferences prefs = getSharedPreferences(AppConstants.AUTH_PREFERENCE_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(AppConstants.AUTH_TOKEN_NAME, authToken).apply();

        // Navigate to another fragment
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragmentContainer, new TransactionListFragment())
                .commit();
    }

    @Override
    public void onLogout() {
        SharedPreferences prefs = getSharedPreferences(AppConstants.AUTH_PREFERENCE_NAME, Context.MODE_PRIVATE);
        prefs.edit().remove(AppConstants.AUTH_TOKEN_NAME).apply();

        // Navigate to login fragment
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragmentContainer, new LoginFragment())
                .commit();
    }
}