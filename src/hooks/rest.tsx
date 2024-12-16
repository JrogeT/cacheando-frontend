import axios from 'axios';
import {Observable} from "rxjs";

const useRestService = () => {
    const baseUrl = 'https://cacheando-api-64de34de5015.herokuapp.com/api';

    const get = (endpoint: string) => {
        return new Observable(subscriber => {
            axios.get(baseUrl + endpoint)
                .then(response => {
                    subscriber.next(response);
                    subscriber.complete();
                })
                .catch(error => {
                    subscriber.error(error);
                });
        });
    }

    const post = (endpoint: string, request: any) => {
        return new Observable(subscriber => {
            axios.post(baseUrl + endpoint, request)
                .then(response => {
                    subscriber.next(response);
                    subscriber.complete();
                })
                .catch(error => {
                    subscriber.error(error);
                });
        });
    }

    return {
        get,
        post
    };
};

export default useRestService;