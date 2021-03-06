import React, { Component } from 'react'
import './header.less'
import {formateDate} from '../../utils/dateUtils'
// import memoryUtils from '../../utils/memoryUtils'
// import storageUtils from '../../utils/storageUtils'
import {reqWeather} from '../../api/index'
import {withRouter} from 'react-router-dom'
import menuList from '../../config/menuConfig'
import { Modal } from 'antd';
import LinkButton from '../link-button/link-button'
import {connect} from 'react-redux'
import {logout} from '../../redux/actions'

class Header extends Component {

    state ={
        currentTime:formateDate(Date.now()),
        weather:''
    }

    // 第一次render之后执行，一般在此执行异步操作
    componentDidMount(){
        this.getTime()
        this.getWeather()
    }

    getTime=()=>{
        this.intervalId = setInterval(()=>{
            const currentTime = formateDate(Date.now())
            this.setState({currentTime})
        },1000)
    }
    getWeather =async ()=>{
        const weather =await reqWeather()
        this.setState({weather})
    }

    getTitle = ()=>{
        // console.log(menuList)
        const path = this.props.location.pathname
        let title
        menuList.forEach(item=>{
            if(item.key===path){
                title = item.title
            }else if(item.children){
                const cItem = item.children.find(cItem => path.indexOf(cItem.key)===0)
                if(cItem){
                    title = cItem.title
                }
            }
        })
        return title
    }

    // 退出登录
    logout = ()=>{
        Modal.confirm({
            content: '确定退出吗',
            onOk:()=> {
                // 删除保存的user,跳转到登录
                // storageUtils.removeUser()
                // memoryUtils.user = {}
                this.props.logout()
                this.props.history.replace('/login')
            },
          })
    }

    render() {
        const {currentTime,weather} = this.state
        const {username} = this.props.user
        // const title = this.getTitle()
        const title = this.props.headTitle
        return (
            <div className="header">
                <div className="header-top">
                    <span>欢迎，{username}</span>
                    <LinkButton onClick={this.logout}>退出</LinkButton>
                </div>
                <div className="header-bottom">
                    <div className="heade-bottom-left">{title}</div>
                    <div className="heade-bottom-right">
                        <span>{currentTime}</span>
                        <span>{weather}</span>
                    </div>
                </div>
            </div>
        )
    }

    // 当前组件卸载之前
    componentWillUnmount(){
        // 清除定时器
        clearInterval(this.intervalId)
    }
}

export default connect(
    state =>({headTitle:state.headTitle,user:state.user}),
    {logout}
)(withRouter(Header))