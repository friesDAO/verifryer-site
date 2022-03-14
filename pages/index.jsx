import { useWallet } from "@gimmixorg/use-wallet"
import { useEffect, useState, useRef } from "react";
import getWeb3ModalConfig from "../util/getWeb3ModalConfig.js"
import project from "../config/project.json"
import classNames from "classnames";
import { parse, format } from "../util/number.js";
import { ethers } from "ethers";
import useCheckpoint from "../state/useCheckpoint.js"
import { useRouter } from 'next/router'

const WalletManager = () => {
	const { account, disconnect } = useWallet()

	function click() {
		window.open(`${project.explorer}/address/${account}`, '_blank');
	}

	return (
		<>
			<div className="wallet-manager row center-a">
				<button className={"connect rounded secondary"} onClick={click}>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect"}</button>
				<button className="disconnect tertiary" onClick={disconnect}><i className="fas fa-sign-out-alt"></i></button>
			</div>
			
			<style jsx>{`
				.wallet-manager {
					gap: 10px;
				}

				.connect {
					font-size: 1.4em;
					padding: 5px 15px;
					font-weight: 600;
				}

				.disconnect {
					height: 44px;
					width: 44px;
					font-size: 1.4em;
					background-color: var(--bg);
				}

				.disconnect > i {
					color: var(--text);
				}
			`}</style>
		</>
	)
}

const Home = () => {
	const router = useRouter()
	const { account, connect, provider } = useWallet();
	const [ completed, setCompleted ] = useState(false)
	const checkpoint = useCheckpoint(account, provider, promptConnect, router.query.id, completed)
	const [ pdfLoaded, setPdfLoaded ] = useState(false)
	const pdf = useRef(null)
	pdf.current?.addEventListener("load", () => setPdfLoaded(true))
	useEffect(() => {
		const interval = setInterval(() => {
			if (pdfLoaded) {
				clearInterval(interval)
				return
			}
			pdf.current.src = "https://docs.google.com/viewerng/viewer?url=https://fries.fund/friesDAO_Operating_Agreement.pdf&embedded=true"
		}, 2000)

		return () => {
			clearInterval(interval)
		}
	}, [pdfLoaded])

	function promptConnect() {
		connect(getWeb3ModalConfig())
	}

	function sign() {
		provider.getSigner().signMessage("I agree to the friesDAO operating agreement").then((signedMessage) => {
			fetch('/api/createSignature', {
                body: JSON.stringify({
                    address: account,
                    signature: signedMessage
                }),
                method: 'POST'
            }).then(() => {
				checkpoint.update()
			})
		})
	}

	async function verify() {
		const decodedUserId = await fetch(`/api/decodeUserId`, {
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({
				encryptedUserId: decodeURIComponent(router.query.id),
			}),
			method: "POST"
		}).then(res => res.text()).catch()
		provider.getSigner().signMessage(decodedUserId).then((signedMessage) => {
			fetch('/api/createDiscordWalletSignature', {
                body: JSON.stringify({
					encryptedUserId: router.query.id,
                    address: account,
                    signature: signedMessage
                }),
                method: 'POST'
            }).then(() => {
				setCompleted(true)
				checkpoint.update()
			})
		})
	}

	return (
		<>
			<div className="checkpoint-container">
				<img className={classNames("spinner", {
					visible: checkpoint.state == 0
				})} src="/spinner.svg" />

				<div className={classNames("connect-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 1
				})}>
					<img className="logo" src={project.logo} />

					<div className="title">welcome to friesDAO!</div>

					<button className="connect primary" onClick={promptConnect}>connect wallet</button>
				</div>

				<div className={classNames("invalid-id-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 2
				})}>
					<div className="title">invalid discord id! (check URL)</div>
				</div>

				<div className={classNames("operating-agreement-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 3
				})}>
					<div className="sign-title">sign the friesDAO <a className="underline" href="https://fries.fund/friesDAO_Operating_Agreement.pdf" target="_blank">operating agreement</a></div>
					<div className="pdf card">
						<img className={classNames("spinner", {
							visible: !pdfLoaded
						})} src="./spinner.svg" />
						<iframe ref={pdf} src="https://docs.google.com/viewerng/viewer?url=https://fries.fund/friesDAO_Operating_Agreement.pdf&embedded=true" frameBorder="0" height="100%" width="100%" />
					</div>
					<button className="sign primary" onClick={sign}>accept and sign</button>
				</div>

				<div className={classNames("verify-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 4
				})}>
					<div className="sign-title">link your discord account and wallet</div>
					<WalletManager />
					<button className="verify primary" onClick={verify}>verify wallet</button>
				</div>

				<div className={classNames("completed-page", "page", "patterned", "col", "center-m", "center-a", {
					visible: checkpoint.state == 5
				})}>
					<div className="title">you're all set!</div>
					<div className="token-desc">check back in discord to check out your roles</div>
				</div>

			</div>

			<style jsx>{`
				.checkpoint-container {
					transition: 0.25s opacity, 0.25s visibility;
					z-index: 999;
				}
				
				.spinner {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					height: 300px;
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
				}

				.page {
					position: absolute;
					height: 100vh;
					padding: 20px;
					width: 100%;
					transition: 0.25s opacity;
					background-color: var(--bg);
					opacity: 0;
					visibility: hidden;
					transition: 0.25s opacity, 0.25s visibility;
				}

				.connect-page {
					gap: 40px;
				}

				.operating-agreement-page {
					gap: 20px;
				}

				.verify-page {
					gap: 20px;
				}
				
				.visible {
					opacity: 1;
    				visibility: unset;
    				transition: visibility 0s 0s, opacity 0.25s 0s;
				}

				.checkpoint-container.visible {
					display: block;
				}

				.logo {
					max-width: 400px;
					width: 100%;
				}

				.title {
					font-size: 4em;
					font-weight: 700;
					text-align: center;
				}

				.sign-title, .token-title {
					font-size: 3em;
					font-weight: 700;
					text-align: center;
				}

				.token-page {
					gap: 20px;
				}

				.token-balance {
					font-size: 2em;
					text-align: center;
					font-weight: 600;
				}

				.token-desc {
					font-size: 1.5em;
					text-align: center;
				}

				.connect, .sign, .verify {
					font-size: 2em;
					padding: 8px 20px;
					text-align: center;
				}

				.pdf {
					max-width: 700px;
					width: 95%;
					height: 500px;
				}

				@media only screen and (max-height: 700px) {
					.logo {
						max-width: unset;
						width: unset;
						height: 300px;
					}

					.connect-page {
						gap: 16px;
					}

					.operating-agreement-page {
						font-size: 12px;
					}

					.token-page {
						font-size: 12px;
						gap: 12px;
					}

					.pdf {
						height: 300px;
					}
				}

				@media only screen and (max-height: 500px) {
					.logo {
						max-width: unset;
						width: unset;
						height: 250px;
					}

					.connect-page {
						gap: 8px;
						font-size: 12px;
					}

					.operating-agreement-page {
						gap: 8px;
					}

					.pdf {
						height: 200px;
					}
				}

				@media only screen and (max-width: 700px) {
					.connect-page {
						font-size: 12px;
						gap: 24px;
					}

					.operating-agreement-page {
						font-size: 12px;
					}

					.token-page {
						font-size: 12px;
						gap: 12px;
					}
				}
			`}</style>
		</>
	)
}

export default Home