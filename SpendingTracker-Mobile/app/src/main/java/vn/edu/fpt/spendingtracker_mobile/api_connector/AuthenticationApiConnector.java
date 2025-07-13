package vn.edu.fpt.spendingtracker_mobile.api_connector;

import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class AuthenticationApiConnector {
    private static String AUTHENTICATION_ROUTE_PREFIX =
            AppConstants.API_SCHEME + "://" +
            AppConstants.API_DOMAIN + "/api/auth";
    private static String SIGN_IN_ROUTE = AUTHENTICATION_ROUTE_PREFIX + "/sign-in";
    private static String SIGN_UP_ROUTE = AUTHENTICATION_ROUTE_PREFIX + "/sign-up";
    private static String GOOGLE_SIGN_IN_ROUTE = AUTHENTICATION_ROUTE_PREFIX + "/google/mobile-sign-in";

}
