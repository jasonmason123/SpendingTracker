package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.view.View;

import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import vn.edu.fpt.spendingtracker_mobile.MainActivity;

public abstract class BaseFragment extends Fragment {
    // Override to specify if BottomNavigationView should be visible
    protected abstract boolean shouldShowBottomNavigation();

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
    }
}
