# Responsive StyleSheet

Enhances React Native's StyleSheet by adding media queries. It's API-compatible with the current StyleSheet which means that all styles in your project already work as-is without extra work from you.

## Usage

Any media query should be placed inside the `@media` object of a style.

```javascript
import React from 'react'
import { View } from 'react-native'
import { ResponsiveStyleSheet, withResponsiveness } from 'responsive-stylesheet'

const styles = ResponsiveStyleSheet.create({
    static: {
        backgroundColor: 'red'
    },
    dynamic: {
        backgroundColor: 'green'

        '@media': {
            'ios and (orientation: landscape) and (min-width: 300px)': {
                color: 'blue'
            }
        }
    }
})

<View style={styles.static} /> // works
<View style={styles.dynamic} /> // does not work

const ResponsiveView = withResponsiveness(View)
<ResponsiveView style={styles.dynamic} /> // works
```

## How it works

Styles without the `@media` key are added to the styles object, while styles that do have that key are converted into pure functions that return an inline style based on the current state of the application, allowing us to respond to changes in the application state.
