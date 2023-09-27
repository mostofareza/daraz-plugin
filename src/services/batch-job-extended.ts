import { MedusaError } from "medusa-core-utils";

import BatchJobRepository from "@medusajs/medusa/dist/repositories/batch-job";
import { TransactionBaseService } from "@medusajs/medusa";
import { buildQuery } from "@medusajs/medusa/dist/utils";

class BatchJobExtendedService extends TransactionBaseService {
  protected readonly batchJobRepository_: typeof BatchJobRepository;

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);

    this.batchJobRepository_ = BatchJobRepository;
  }

  async delete(batchJobId: string): Promise<any | null> {
    return await this.atomicPhase_(async () => {
      const query = buildQuery({ id: batchJobId });
      const batchJob = await this.batchJobRepository_.findOne(query);

      if (!batchJob) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Batch job with id ${batchJobId} was not found`
        );
      }

      // Delete the batch job
      await this.batchJobRepository_.delete(batchJobId);
    });
  }

  async deleteAll(): Promise<void> {
    return await this.atomicPhase_(async () => {
      // Clear all batch job
      await this.batchJobRepository_.clear();
    });
  }
}

export default BatchJobExtendedService;
