# React Native / Relay TodoMVC

## Installation

```
npm install -g react-native-cli && npm install
```

## Running

### Start the GraphQL server:

```
npm start
```

### Ensure you can connect to the development server:

#### iOS

Ensure that you are on the same WiFi network as your computer. If you're using a
cell data plan, your phone can't access your computer's local IP address.

#### Android

You need to run `adb reverse tcp:8081 tcp:8081` to forward requests from the
device to your computer. This works only on Android 5.0 and newer.

#### If all else fails

Open `app.js` and change `localhost:8080` to an IP/port that your device can
access.

### Run on your device of choice:

```
react-native run-ios  # or...
react-native run-android
```

## Developing

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.json`, and restart the server:

```
npm run update-schema
npm start
```

## License

    This file provided by Facebook is for non-commercial testing and evaluation
    purposes only.  Facebook reserves all rights not expressly granted.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
    ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
