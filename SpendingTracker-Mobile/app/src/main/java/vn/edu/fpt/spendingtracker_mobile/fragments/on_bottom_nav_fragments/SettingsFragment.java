package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.fragments.BaseFragment;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class SettingsFragment extends BaseFragment {
    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

    // callback method implemented by MainActivity
    public interface SettingsFragmentListener
    {
        public void onLogout();
    }

    private SettingsFragment.SettingsFragmentListener listener;
    private TextView emailTextView;

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        listener = (SettingsFragment.SettingsFragmentListener) activity;
    }

    @Override
    public void onDetach() {
        super.onDetach();
        listener = null;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        super.onCreateView(inflater, container, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes
        setHasOptionsMenu(true); // fragment has menu items to display

        View view = inflater.inflate(R.layout.fragment_settings, container, false);
        emailTextView = (TextView) view.findViewById(R.id.email_text_view);
        SharedPreferences prefs = getActivity()
                .getSharedPreferences(AppConstants.AUTH_PREFERENCE_NAME, Context.MODE_PRIVATE);
        String email = prefs.getString(AppConstants.AUTH_EMAIL, null);
        emailTextView.setText(email != null ? email : "");
        Button logoutButton =
                (Button) view.findViewById(R.id.logout_button);
        logoutButton.setOnClickListener(logoutButtonClicked);

        return view;
    };

    View.OnClickListener logoutButtonClicked = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            listener.onLogout();
        }
    };
}
