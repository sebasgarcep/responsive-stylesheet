import React, { Component } from 'react'
import mediaQuery from 'css-mediaquery'
import { mapValues, omit } from 'lodash'
import { Dimensions, StyleSheet, Platform } from 'react-native'

const MEDIA_KEY = '@media'

export class ResponsiveStyleSheet {
  // eslint-disable-next-line no-undef
  static absoluteFill = StyleSheet.absoluteFill
  // eslint-disable-next-line no-undef
  static absoluteFillObject = StyleSheet.absoluteFillObject
  // eslint-disable-next-line no-undef
  static hairlineWidth = StyleSheet.hairlineWidth

  // eslint-disable-next-line no-undef
  static create = (options) => {
    return new ResponsiveStyleSheet(options)
  }

  constructor (options) {
    this._options = options

    this._static = StyleSheet.create(mapValues(options, value => {
      return this._getBaseStyles(value)
    }))

    this._media = mapValues(options, value => {
      const media = value[MEDIA_KEY]

      if (!media) {
        return []
      }

      return this._getSelectorsBySpecificity(media)
    })

    for (const key in options) {
      this[key] = this._getStyleFromResponsiveProps(key)
    }
  }

    // eslint-disable-next-line no-undef
  _getBaseStyles = (value) => {
    return omit(value, [MEDIA_KEY])
  }

    // eslint-disable-next-line no-undef
  _shouldApplySelector = (selector, responsiveProps) => {
    const mediaQueryValues = {
      type: responsiveProps.platform,
      orientation: responsiveProps.orientation,
      width: responsiveProps.width,
      height: responsiveProps.height
    }

    return mediaQuery.match(selector, mediaQueryValues)
  }

    // eslint-disable-next-line no-undef
  _countAndOccurence = (selector) => {
    const searchStr = ' and '

    let count = 0
    for (let i = 0; i < selector.length - searchStr.length + 1; i += 1) {
      const substring = selector.substring(i, i + searchStr.length)
      if (substring === searchStr) {
        count += 1
      }
    }

    return count
  }

    // eslint-disable-next-line no-undef
  _getSelectorsBySpecificity = (media) => {
    const selectorList = Object.keys(media)

    return selectorList.sort((a, b) => {
      if (a.includes('all') && !b.includes('all')) return -1
      if (b.includes('all') && !a.includes('all')) return 1
      return this._countAndOccurence(a) - this._countAndOccurence(b)
    })
  }

    // eslint-disable-next-line no-undef
  _getStyleFromResponsiveProps = (key) => {
    if (this._media[key].length === 0) {
      return this._static[key]
    }

    const dynamicStyle = (responsiveProps) => {
      const finalStyle = {}

      const selectorList = this._media[key]

      for (const selector of selectorList) {
        if (this._shouldApplySelector(selector, responsiveProps)) {
          let itemStyle = this._options[key][MEDIA_KEY][selector]

          if (typeof itemStyle === 'function') {
            itemStyle = itemStyle(responsiveProps)
          }

          Object.assign(finalStyle, itemStyle)
        }
      }

      return finalStyle
    }

    return [this._static[key], dynamicStyle]
  }
}

export const withResponsiveProps = (Base) => {
  return class ResponsivePropsWrapper extends Component {
    // eslint-disable-next-line no-undef
    state = Dimensions.get('window')

    // eslint-disable-next-line no-undef
    getResponsiveProps = () => {
      const { height, width } = this.state
      return {
        ...this.state,
        orientation: height > width ? 'portrait' : 'landscape',
        platform: Platform.OS
      }
    }

    // eslint-disable-next-line no-undef
    dimensionListener = ({ window }) => {
      this.setState(window)
    }

    componentDidMount () {
      Dimensions.addEventListener('change', this.dimensionListener)
    }

    componentWillUnmount () {
      Dimensions.removeEventListener('change', this.dimensionListener)
    }

    render () {
      return (
        <Base {...this.props} responsive={this.getResponsiveProps()} />
      )
    }
  }
}

export const withResponsiveness = (Base) => {
  class WithResponsivenessWrapper extends Component {
    // eslint-disable-next-line no-undef
    getStyle = (style) => {
      if (Array.isArray(style)) {
        return style.map(item => this.getStyle(item))
      }

      if (typeof style !== 'function') {
        return style
      }

      return style(this.props.responsive)
    }

    render () {
      const style = this.getStyle(this.props.style)
      return (
        <Base {...this.props} style={style} />
      )
    }
  }

  return withResponsiveProps(WithResponsivenessWrapper)
}
