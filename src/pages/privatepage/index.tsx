import { Header } from '@/components'
import '../agreement/index.less'

const PrivatePage = ()=>{
    return (
        <div className="argeement-wrap">
            <Header/>
            <div className="title">鹦鹉智绘用户隐私协议</div>
            <div  className="text">欢迎使用鹦鹉智绘！我们致力于保护用户的个人信息安全和隐私。本隐私协议将解释我们如何收集、使用和保护您的个人信息。请在使用我们的服务之前仔细阅读并理解此隐私协议。如果您对本协议的任何条款有疑问，请联系我们。</div>
            <div className="h1">导我们收集的信息言</div>
            {/* <div className="sub-h">欢迎您使用鹦鹉智绘软件及相关服务！</div> */}
            <div className="text">1. 我们可能会收集以下类型的信息：</div>
            <div className="text">个人信息： 当您注册账户、使用我们的服务或与我们联系时，我们可能会收集您的姓名、电子邮件地址、联系方式等个人信息。</div>
            <div className="text">设备信息： 我们可能会自动收集与您的设备相关的信息，例如您的设备型号、操作系统版本、唯一设备标识符等。</div>
            <div className="text">日志信息： 当您使用我们的服务时，我们可能会自动记录相关信息，包括您的IP地址、浏览器类型、访问时间等。</div>
            <div className="text">使用信息： 我们可能会记录您使用我们服务的方式和频率，以及您与我们服务互动的其他信息。</div>
            <div className="text">2 我们收集的信息将用于以下目的：</div>
            <div className="text">提供和维护服务；个性化体验；安全保障；合规要求。</div>
            <div className="h1">信息的分享</div>
            <div className="text">我们不会向任何第三方出售、出租或交易您的个人信息。我们可能会与以下类型的第三方分享您的信息：服务提供商；法定要求；合规要求。</div>
            <div className="h1">管理您的个人信息</div>
            <div className="text">您可以随时访问、更正、删除或限制我们对您个人信息的处理。如果您希望行使这些权利或有任何其他隐私问题，请联系我们。</div>
            <div className="h1">我们保护个人信息的安全</div>
            <div className="text">我们将采取合理的措施来保护您的个人信息，防止未经授权的访问、使用或披露。我们将您的信息存储在安全的服务器上，并采取加密和其他安全措施来保护您的信息安全。</div>
            <div className="h1">存储个人信息</div>
            <div className="text">我们将在符合适用法律法规要求的情况下，将您的个人信息存储于中华人民共和国境内。</div>
            <div className="h1">保护未成年人</div>
            <div className="text">我们重视对未成年人个人信息的保护。如果您是未成年人，在使用我们的服务前，请您的监护人仔细阅读本隐私协议，并在您使用我们的服务时给予必要的指导和同意。</div>
            <div className="h1">保护未成年人</div>
            <div className="text">隐私政策的查阅和修订</div>
            <div className="text">我们可能会不时更新本隐私协议，以反映我们的服务和数据处理实践的变化。我们将通过适当方式向您提供更新后的隐私协议。您继续使用我们的服务将视为您接受修订后的隐私协议。</div>
            <div className="h1">联系我们</div>
            <div className="text">如果您对本隐私协议有任何疑问、意见或投诉，请联系我们：[联系方式]</div>
            <div className="text">感谢您阅读我们的隐私协议！</div>
            <div className="end">最后更新日期：2024-3-18</div>
        </div>
    )
}

export default PrivatePage