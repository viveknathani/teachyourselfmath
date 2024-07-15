import { z } from 'zod';
import cron from 'cron-validate';

const isValidCronExpression = (expression: string): boolean => {
  const result = cron(expression, { preset: 'default' });
  if (!result.isValid()) {
    console.log('nahi muje hi dikkat hai', result);
    return false;
  }

  const { minutes, hours } = result.getValue();

  // Should not run more than once a day
  if (minutes.includes('*') || hours.includes('*')) {
    console.log('returning from here!');
    return false;
  }

  return true;
};

const isValidUserConfiguration = (data: any, validListOfTags: string[]) => {
  const validator = z.object({
    tags: z
      .array(z.string())
      .refine((list) => list.every((tag) => validListOfTags.includes(tag))),
    schedule: z.string().refine(isValidCronExpression, {
      message:
        'Invalid schedule. Expecting a cron syntax that should not be more than once a day!',
    }),
    countEasy: z.number(),
    countMedium: z.number(),
    countHard: z.number(),
  });

  const result = validator.safeParse(data);

  return {
    ok: result.success,
    issues: result.error?.issues,
  };
};

export { isValidUserConfiguration };
