# automl-prediction

AutoML Prediction is an Airtable Block that helps you invoke predictions of custom models built and deployed on [AutoML](https://cloud.google.com/automl).

You can find the demo of this block as part of this [video presentation](https://www.youtube.com/watch?v=MCRoMVyhLdI&list=PLeUD0-i-p8Sn_5GbT6fijjPYd4ipmo1aM&index=3&t=0s).

## Cavets
As stated in the [documentation](https://cloud.google.com/vision/automl/docs/before-you-begin), AutoML currently supports only service account based authentication to their APIs. Hence this block would need a service account email address and private key configured before it can be used. As with any block configurations on Airtable, these will be accessible to all the collaborators of the base.

Also because of [Google Cloud's lack of browser support](https://github.com/googleapis/nodejs-dialogflow/issues/405#issuecomment-522745669) for their client SDKs and CORS Headers, you need a proxy running in order to access the Google Cloud Services. We've a ready to use docker container that sets up an nginx with HTTPS Certificates for this purpose. You can check them out at https://github.com/ashwanthkumar/gcloud-proxy-cors.


## License

MIT
