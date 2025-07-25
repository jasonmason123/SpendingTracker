package vn.edu.fpt.spendingtracker_mobile.fragments.base_fragment;

import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import vn.edu.fpt.spendingtracker_mobile.MainActivity;

public abstract class BaseFragment extends Fragment {
    // Override to specify if BottomNavigationView should be visible
    protected abstract boolean shouldShowBottomNavigation();
    protected abstract boolean shouldDisplayBackButton();

    @Override
    public void onStart() {
        super.onStart();
        // Set BottomNavigationView visibility
        if (getActivity() instanceof MainActivity) {
            BottomNavigationView navView =
                ((MainActivity) getActivity()).getBottomNavigationView();
            if (navView != null) {
                navView.setVisibility(
                    shouldShowBottomNavigation() ? View.VISIBLE : View.GONE);
            }
        }

        // Display back button
        AppCompatActivity activity = (AppCompatActivity) requireActivity();
        activity.getSupportActionBar().setDisplayHomeAsUpEnabled(shouldDisplayBackButton());
    }
}
