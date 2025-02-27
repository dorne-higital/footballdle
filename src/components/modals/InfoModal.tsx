import { Cell } from '../grid/Cell'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        You have 6 tries to guess the Premier League Footballer. The tiles will change colour to show you how close you get.
      </p>

      <p>
      <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
    data-id="dhorne92E" data-description="Support me on Buy me a coffee!" data-message="" data-color="#00ff00"
    data-position="Right" data-x_margin="18" data-y_margin="18"></script>
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="S"
          status="correct"
        />
        <Cell value="A" />
        <Cell value="L" />
        <Cell value="A" />
        <Cell value="H" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter S is in the name and in the correct spot.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell value="N" />
        <Cell value="D" />
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="I"
          status="present"
        />
        <Cell value="D" />
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="I"
          status="present"
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter I is in the name but in the wrong spot.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell value="V" />
        <Cell value="A" />
        <Cell value="R" />
        <Cell isRevealing={true} isCompleted={true} value="D" status="absent" />
        <Cell value="Y" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        The letter D is not in the name in any spot.
      </p>

    </BaseModal>
  )
}
