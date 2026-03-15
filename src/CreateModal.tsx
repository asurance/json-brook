import { Button, Form, Modal } from "solid-bootstrap";

export type CreateModalProps = {
	show: boolean;
	onCancel?: () => void;
	onOk?: (result: string) => void;
};

const CreateModal = (props: CreateModalProps) => {
	let contentRef!: HTMLTextAreaElement;
	return (
		<Modal show={props.show} onHide={props.onCancel}>
			<Modal.Header closeButton>
				<Modal.Title>创建新示例</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group controlId="content">
						<Form.Label>示例内容</Form.Label>
						<Form.Control ref={contentRef} as="textarea" rows={10} />
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={props.onCancel}>
					取消
				</Button>
				<Button
					variant="primary"
					onClick={() => {
						props.onOk?.(contentRef.value);
					}}
				>
					确定
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CreateModal;
