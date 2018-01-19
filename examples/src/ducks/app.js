import Progress from 'react-progress-2';

// action constants
export const LOADING = 'app/LOADING';
export const FAIL = 'app/FAIL';
export const SUCCESS = 'app/SUCCESS';

// state
export const initialState = {
    loading: false,
    error: false,
    success: false,
};

// reducer
/* eslint-disable indent */
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LOADING: {
            if (!state.loading) Progress.show();

            return {
                ...state,
                loading: true,
                error: false,
                success: false,
            };
        }

        case FAIL: {
            Progress.hideAll();

            return {
                ...state,
                loading: false,
                error: true,
                success: false,
            };
        }

        case SUCCESS: {
            Progress.hideAll();

            return {
                ...state,
                loading: false,
                error: false,
                success: true,
            };
        }

        default:
            return state;
    }
};
/* eslint-enable */

// action creators
export const setLoading = () => ({ type: LOADING });
export const setFailed = () => ({ type: FAIL });
export const setSuccess = () => ({ type: SUCCESS });
