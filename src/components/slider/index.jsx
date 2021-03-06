import React from 'react';
import ReactDOM from 'react-dom';
import { autobind } from 'core-decorators';
import classnames from 'classnames';
import { throttle } from '../../../utils';

import './index.scss';

@autobind
class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.container = null;
    this.timer = null;
    this.state = {
      screenIndex: 0,
      visibleNum: 1,
    };
  }

  componentDidMount() {
    this.throttleAdjust = throttle(() => {
      this.setState({
        visibleNum: this.getVisibleNum(),
      });
    }, 200);
    window.addEventListener('resize', this.throttleAdjust);
    // 做重新布局
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({
      visibleNum: this.getVisibleNum(),
    });

    this.timer = window.setInterval(() => {
      this.changeScreen(this.state.screenIndex + 1);
    }, 5000);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttleAdjust);
    window.clearInterval(this.timer);
    this.timer = null;
  }

  getVisibleNum() {
    // 比较粗略的计算，假定一屏的子节点外边距之和不会超过一个子节点的宽度
    /* eslint-disable react/no-find-dom-node */
    let result = 1;
    const containerWidth = this.container.getBoundingClientRect().width;
    const childWidth = this.sliderItemChild0.getBoundingClientRect ? this.sliderItemChild0.getBoundingClientRect().width : ReactDOM.findDOMNode(this.sliderItemChild0).getBoundingClientRect().width;
    if (containerWidth && childWidth) {
      result = Math.floor(containerWidth / childWidth);
    }
    // 有可能result为0，下面的除法就会出现分母为0，从而导致得出Inifity，无限循环导致浏览器崩溃
    return result || 1;
  }

  getListWidth() {
    let width = 0;
    const { children } = this.props;
    const { visibleNum } = this.state;
    const len = React.Children.count(children);
    // 最终分成的屏数
    const splitNum = Math.ceil(len / visibleNum);
    if (this.container) {
      const containerWidth = this.container.getBoundingClientRect().width;
      width = containerWidth * splitNum;
    }
    return width;
  }

  changeScreen(i) {
    const { children } = this.props;
    const { screenIndex, visibleNum } = this.state;
    const len = React.Children.count(children);
    // 分成的屏数
    const splitNum = Math.ceil(len / visibleNum);
    if (i !== screenIndex) {
      this.setState({
        screenIndex: i % splitNum,
      });
    }
  }

  renderSliderList() {
    const { children } = this.props;
    const { screenIndex, visibleNum } = this.state;
    const splitGroup = [];
    const len = React.Children.count(children);
    // 分成的屏数
    const splitNum = Math.ceil(len / visibleNum);
    /* eslint-disable no-plusplus*/
    for (let i = 0; i < splitNum; i++) {
      splitGroup.push(Array.from(children).slice(i * visibleNum, (i + 1) * visibleNum));
    }
    return (
      <div
        className="slider-list"
        style={{
          transform: `translateX(-${(screenIndex % splitNum) * ((this.container && this.container.getBoundingClientRect().width) || 0)}px)`,
          transition: 'transform 500ms ease',
          width: this.getListWidth(),
        }}
      >
        {
          splitGroup.map((group, i) => (
            <div
              className="slider-screen"
              style={{ width: (this.container && this.container.getBoundingClientRect().width) || 0 }}
              key={i}
            >
              {
                group.map((child, j) => (
                    <div
                      className="slider-item"
                      key={j}
                    >
                      {React.cloneElement(child, {
                        ref: (node) => {
                          this[`sliderItemChild${(i * visibleNum) + j}`] = node;
                        }
                      })}
                    </div>
                  )
                )
              }
            </div>
          ))
        }
      </div>
    );
  }

  renderControl() {
    const { children } = this.props;
    const { screenIndex, visibleNum } = this.state;
    const len = React.Children.count(children);
    // 分成的屏数
    const splitNum = Math.ceil(len / visibleNum);
    const temp = [];
    for (let i = 0; i < splitNum; i++) {
      temp.push((
        <span
          key={i}
          className={
            classnames({
              'slider-control-item': true,
              'slider-control-item-active': i === screenIndex,
            })
          }
          onClick={this.changeScreen.bind(this, i)}
        />
      ));
    }
    return (
      <div className="slider-control">
        {temp}
      </div>
    );
  }

  render() {
    return (
      <div className="slider" ref={(node) => { this.container = node; }}>
        {this.renderSliderList()}
        {this.renderControl()}
      </div>
    );
  }
}

export default Slider;
